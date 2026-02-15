import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";
import { AppError } from "../middleware/error.js";
import type { UserPublic } from "@spanish-class/shared";
import {
  sendBookingConfirmationToStudent,
  sendBookingNotificationToProfessor,
  sendCancellationToStudent,
  sendCancellationToProfessor,
  sendConfirmationRequestToProfessor,
  sendPendingConfirmationToStudent,
} from "./email.js";
import { createMeetingRoom, getMeetingProvider } from "./meeting-provider.js";
import { generateConfirmationToken } from "./confirmation-token.js";

type TransactionClient = Prisma.TransactionClient;

interface BookSlotResult {
  bookingId: string;
  slot: {
    id: string;
    title: string | null;
    startTime: Date;
    endTime: Date;
    meetLink: string | null;
    meetingUrl: string | null;
  };
}

/**
 * Attempt booking with optimistic locking and retry logic
 * Prevents race conditions when multiple students book the same slot simultaneously
 */
async function attemptBooking(
  slotId: string,
  student: UserPublic,
  tx: TransactionClient,
): Promise<{ booking: any; slot: any }> {
  // Read current slot state with version
  const slot = await tx.availabilitySlot.findUnique({
    where: { id: slotId },
    include: {
      professor: {
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
      },
      allowedStudents: {
        select: { studentId: true },
      },
    },
  });

  if (!slot) {
    throw new AppError(404, "Slot not found");
  }

  // Check if slot is private and student is allowed
  if (slot.isPrivate) {
    const isAllowed = slot.allowedStudents.some(
      (s: { studentId: string }) => s.studentId === student.id,
    );
    if (!isAllowed) {
      throw new AppError(
        403,
        "This slot is private and you are not authorized to book it",
      );
    }
  }

  // Check if slot is available
  if (slot.status !== "AVAILABLE") {
    throw new AppError(400, "This slot is no longer available");
  }

  // Check capacity
  if (slot.currentParticipants >= slot.maxParticipants) {
    throw new AppError(400, "This slot is fully booked");
  }

  // Check if slot is in the future
  if (new Date(slot.startTime) <= new Date()) {
    throw new AppError(400, "Cannot book a slot in the past");
  }

  // Check for duplicate booking
  const existingBooking = await tx.booking.findFirst({
    where: {
      slotId,
      studentId: student.id,
      status: { in: ["CONFIRMED", "PENDING_CONFIRMATION"] },
    },
  });

  if (existingBooking) {
    throw new AppError(400, "You have already booked this slot");
  }

  // Generate confirmation token for professor approval
  const { token, expiresAt, jti } = generateConfirmationToken(
    "", // Will be updated after booking is created
    slot.professorId,
    student.id,
  );

  // Create the booking with PENDING_CONFIRMATION status
  const booking = await tx.booking.create({
    data: {
      slotId,
      studentId: student.id,
      status: "PENDING_CONFIRMATION",
      confirmationToken: token,
      confirmationExpiresAt: expiresAt,
    },
  });

  // Update the token with the actual booking ID
  const { token: finalToken } = generateConfirmationToken(
    booking.id,
    slot.professorId,
    student.id,
  );

  // Update booking with correct token
  await tx.booking.update({
    where: { id: booking.id },
    data: { confirmationToken: finalToken },
  });

  // Generate meeting room if not already created (idempotent)
  let meetLink = slot.meetLink;
  if (!meetLink) {
    const meeting = createMeetingRoom(slot.id);
    meetLink = meeting.roomName;
  }

  // Update slot with optimistic locking: check version hasn't changed
  const newParticipants = slot.currentParticipants + 1;
  const newStatus =
    newParticipants >= slot.maxParticipants ? "FULLY_BOOKED" : "AVAILABLE";

  // Optimistic locking: update only if version matches
  const updateResult = await tx.availabilitySlot.updateMany({
    where: {
      id: slotId,
      version: slot.version, // Only update if version hasn't changed
    },
    data: {
      currentParticipants: newParticipants,
      status: newStatus,
      meetLink,
      version: { increment: 1 }, // Increment version
    },
  });

  // Check if update succeeded (version matched)
  if (updateResult.count === 0) {
    throw new AppError(
      409,
      "Slot was modified by another request. Please try again.",
    );
  }

  return { booking, slot: { ...slot, meetLink } };
}

export async function bookSlot(
  slotId: string,
  student: UserPublic,
): Promise<BookSlotResult> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  // Retry loop for optimistic locking conflicts
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx: TransactionClient) => {
          return await attemptBooking(slotId, student, tx);
        },
      );

      // After transaction: Send emails (non-blocking)
      const { booking, slot } = result;

      // Get meeting URL from room name
      const provider = getMeetingProvider();
      const meetingUrl = slot.meetLink
        ? provider.getJoinUrl(
            slot.meetLink,
            `${student.firstName} ${student.lastName}`,
          )
        : null;

      // Send confirmation request emails (don't await, let them run in background)
      const slotForEmail =
        slot as unknown as import("@spanish-class/shared").AvailabilitySlot;
      Promise.all([
        sendPendingConfirmationToStudent({
          slot: slotForEmail,
          professor: slot.professor,
          student,
        }),
        sendConfirmationRequestToProfessor({
          slot: slotForEmail,
          professor: slot.professor,
          student,
          confirmationToken: booking.confirmationToken || "",
          expiresAt: booking.confirmationExpiresAt || new Date(),
        }),
      ]).catch((err: unknown) =>
        console.error("Failed to send booking emails:", err),
      );

      return {
        bookingId: booking.id,
        slot: {
          id: slot.id,
          title: slot.title,
          startTime: slot.startTime,
          endTime: slot.endTime,
          meetLink: slot.meetLink,
          meetingUrl,
        },
      };
    } catch (error: unknown) {
      // Retry on optimistic locking conflict (409)
      if (error instanceof AppError && error.statusCode === 409) {
        lastError = error;
        // Wait with exponential backoff before retry
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 100),
        );
        continue;
      }
      // Re-throw other errors immediately
      throw error;
    }
  }

  // All retries failed
  throw (
    lastError ||
    new AppError(409, "Failed to book slot after multiple attempts")
  );
}

export async function cancelBooking(
  bookingId: string,
  user: UserPublic,
  reason?: string,
): Promise<void> {
  const result = await prisma.$transaction(async (tx: TransactionClient) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: {
          include: {
            professor: {
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
            },
          },
        },
        student: {
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
        },
      },
    });

    if (!booking) {
      throw new AppError(404, "Booking not found");
    }

    if (booking.status !== "CONFIRMED") {
      throw new AppError(400, "This booking cannot be cancelled");
    }

    // Check authorization: student can cancel their own, admin can cancel any
    const isOwner = booking.studentId === user.id;
    const isAdmin = user.isAdmin;

    if (!isOwner && !isAdmin) {
      throw new AppError(403, "You are not authorized to cancel this booking");
    }

    // Check cancellation policy (24 hours before)
    const hoursUntilStart =
      (new Date(booking.slot.startTime).getTime() - Date.now()) /
      (1000 * 60 * 60);

    if (hoursUntilStart < 24 && !isAdmin) {
      throw new AppError(
        400,
        "Bookings must be cancelled at least 24 hours in advance",
      );
    }

    // Determine who cancelled
    const cancelledBy = isOwner ? "student" : "professor";
    const status = isOwner ? "CANCELLED_BY_STUDENT" : "CANCELLED_BY_PROFESSOR";

    // Update booking
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status,
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    });

    // Update slot participant count and status
    const newParticipants = booking.slot.currentParticipants - 1;

    await tx.availabilitySlot.update({
      where: { id: booking.slotId },
      data: {
        currentParticipants: Math.max(0, newParticipants),
        status: "AVAILABLE",
      },
    });

    return { booking, cancelledBy };
  });

  const { booking, cancelledBy } = result;

  // Send cancellation emails
  // Cast slot to fix Prisma enum vs shared enum type mismatch
  const cancelSlotForEmail =
    booking.slot as unknown as import("@spanish-class/shared").AvailabilitySlot;
  Promise.all([
    sendCancellationToStudent({
      slot: cancelSlotForEmail,
      professor: booking.slot.professor,
      student: booking.student,
      reason,
      cancelledBy: cancelledBy as "student" | "professor",
    }),
    cancelledBy === "student"
      ? sendCancellationToProfessor({
          slot: cancelSlotForEmail,
          professor: booking.slot.professor,
          student: booking.student,
          reason,
        })
      : Promise.resolve(),
  ]).catch((err: unknown) =>
    console.error("Failed to send cancellation emails:", err),
  );
}
