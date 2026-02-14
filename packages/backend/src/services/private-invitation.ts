import { prisma } from "../lib/prisma.js";
import type { UserPublic } from "@spanish-class/shared";
import { AppError } from "../middleware/error.js";
import { createMeetingRoom, getMeetingProvider } from "./meeting-provider.js";
import {
  sendPrivateInvitationEmail,
  sendCancellationToStudent,
  sendCancellationToProfessor,
} from "./email.js";
import { createBookedSessionEvent } from "./google.js";

// T008: Conflict detection function
export async function detectConflicts(
  professorId: string,
  startTime: Date,
  endTime: Date,
  excludeSlotId?: string,
): Promise<boolean> {
  // Check for overlapping slots with confirmed bookings
  const conflict = await prisma.availabilitySlot.findFirst({
    where: {
      id: excludeSlotId ? { not: excludeSlotId } : undefined,
      professorId,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      bookings: {
        some: {
          status: "CONFIRMED",
        },
      },
    },
  });

  return !!conflict;
}

// T009: Create private invitation service method
export async function createPrivateInvitation(data: {
  professorId: string;
  studentId: string;
  startTime: Date;
  endTime: Date;
  title?: string;
  description?: string;
}) {
  const { professorId, studentId, startTime, endTime, title, description } =
    data;

  // Validate student exists
  const student = await prisma.user.findFirst({
    where: { id: studentId, isAdmin: false },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isAdmin: true,
      timezone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!student) {
    throw new AppError(404, "Student not found");
  }

  // Validate professor exists
  const professor = await prisma.user.findFirst({
    where: { id: professorId, isAdmin: true },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isAdmin: true,
      timezone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!professor) {
    throw new AppError(404, "Professor not found");
  }

  // Check for conflicts
  const hasConflict = await detectConflicts(professorId, startTime, endTime);
  if (hasConflict) {
    throw new AppError(
      400,
      "Professor has a conflicting confirmed booking at this time",
    );
  }

  // Create slot and booking in a transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Create private slot
    const slot = await tx.availabilitySlot.create({
      data: {
        professorId,
        startTime,
        endTime,
        slotType: "INDIVIDUAL",
        maxParticipants: 1,
        currentParticipants: 1,
        status: "FULLY_BOOKED", // Private slots are immediately booked
        title: title || "Private Spanish Class",
        description,
        isPrivate: true,
        allowedStudents: {
          create: {
            studentId,
          },
        },
      },
      include: {
        allowedStudents: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Generate and store meeting room
    const meeting = createMeetingRoom(slot.id);
    await tx.availabilitySlot.update({
      where: { id: slot.id },
      data: { meetLink: meeting.roomName },
    });

    // Create confirmed booking
    const booking = await tx.booking.create({
      data: {
        slotId: slot.id,
        studentId,
        status: "CONFIRMED",
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return { slot: { ...slot, meetLink: meeting.roomName }, booking, meeting };
  });

  // T012: Send email notification (non-blocking)
  const provider = getMeetingProvider();
  const meetingUrl = provider.getJoinUrl(
    result.meeting.roomName,
    `${student.firstName} ${student.lastName}`,
  );

  sendPrivateInvitationEmail({
    student,
    professor,
    slot: {
      title: result.slot.title,
      startTime: result.slot.startTime,
      endTime: result.slot.endTime,
    },
    meetLink: meetingUrl,
  }).catch((err) =>
    console.error("Failed to send private invitation email:", err),
  );

  // T026: Create calendar event for reminder notifications
  createBookedSessionEvent({
    booking: { id: result.booking.id },
    slot: {
      id: result.slot.id,
      title: result.slot.title,
      description: result.slot.description,
      startTime: result.slot.startTime,
      endTime: result.slot.endTime,
      slotType: result.slot.slotType,
      googleMeetLink: meetingUrl,
    },
    student: {
      id: student.id,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
    },
    professor: {
      id: professor.id,
      email: professor.email,
      firstName: professor.firstName,
      lastName: professor.lastName,
    },
  })
    .then((calendarResult) => {
      if (calendarResult?.eventId) {
        // Store the calendar event ID in the booking for future reference
        prisma.booking
          .update({
            where: { id: result.booking.id },
            data: { bookedCalendarEventId: calendarResult.eventId },
          })
          .catch((err: any) =>
            console.error("Failed to store calendar event ID:", err),
          );
      }
    })
    .catch((err) =>
      console.error(
        "Failed to create calendar event for private invitation:",
        err,
      ),
    );

  return {
    slot: result.slot,
    booking: result.booking,
    meetLink: meetingUrl,
  };
}

// List private invitations for a professor
export async function listPrivateInvitations(
  professorId: string,
  filters: {
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {},
) {
  const { startDate, endDate, page = 1, limit = 20 } = filters;

  const where: any = {
    professorId,
    isPrivate: true,
  };

  if (startDate) {
    where.startTime = { gte: startDate };
  }

  if (endDate) {
    where.startTime = { ...where.startTime, lte: endDate };
  }

  const [invitations, total] = await Promise.all([
    prisma.availabilitySlot.findMany({
      where,
      include: {
        allowedStudents: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        bookings: {
          where: { status: "CONFIRMED" },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.availabilitySlot.count({ where }),
  ]);

  return {
    invitations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// T033: Cancel private invitation
export async function cancelPrivateInvitation(
  slotId: string,
  professorId: string,
  reason?: string,
) {
  // Verify slot exists and belongs to professor
  const slot = await prisma.availabilitySlot.findFirst({
    where: {
      id: slotId,
      professorId,
      isPrivate: true,
    },
    include: {
      professor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isAdmin: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      bookings: {
        where: { status: "CONFIRMED" },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isAdmin: true,
              timezone: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  if (!slot) {
    throw new AppError(404, "Private invitation not found");
  }

  if (slot.bookings.length === 0) {
    throw new AppError(
      400,
      "No confirmed booking found for this private invitation",
    );
  }

  const booking = slot.bookings[0];
  const student = booking.student;

  // Cancel booking and slot in transaction
  await prisma.$transaction([
    prisma.booking.updateMany({
      where: {
        slotId: slot.id,
        status: "CONFIRMED",
      },
      data: {
        status: "CANCELLED_BY_PROFESSOR",
        cancelledAt: new Date(),
        cancelReason: reason || null,
      },
    }),
    prisma.availabilitySlot.update({
      where: { id: slot.id },
      data: {
        status: "CANCELLED",
        currentParticipants: 0,
      },
    }),
  ]);

  // T035: Send cancellation emails (non-blocking)
  const slotForEmail =
    slot as unknown as import("@spanish-class/shared").AvailabilitySlot;
  Promise.all([
    sendCancellationToStudent({
      slot: slotForEmail,
      professor: slot.professor,
      student,
      reason,
      cancelledBy: "professor",
    }),
    sendCancellationToProfessor({
      slot: slotForEmail,
      professor: slot.professor,
      student,
      reason,
    }),
  ]).catch((err) => console.error("Failed to send cancellation emails:", err));

  return { success: true };
}
