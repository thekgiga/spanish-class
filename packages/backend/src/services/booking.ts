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
  sendWaitlistConfirmationToStudent,
  sendWaitlistPromotionToStudent,
} from "./email.js";
import { createMeetingRoom, getMeetingProvider } from "./meeting-provider.js";
import { generateConfirmationToken } from "./confirmation-token.js";
import { createNotification } from "./notifications.js";

type TransactionClient = Prisma.TransactionClient;

/** Format a UTC date for an in-app notification body, shown in the recipient's timezone. */
function formatForNotification(date: Date | string, timezone?: string | null): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone || "UTC",
    timeZoneName: "short",
  }).format(new Date(date));
}

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
  /**
   * Full booking record (with nested slot + professor) shaped like
   * `BookingWithSlot` from @spanish-class/shared. Provided so the client can
   * render the pending-confirmation card immediately after booking without a
   * follow-up round trip. Status will always be PENDING_CONFIRMATION here.
   */
  booking: import("@spanish-class/shared").BookingWithSlot;
}

interface WaitlistResult {
  waitlisted: true;
  position: number;
  slotId: string;
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

  // BLOCKED slots are never bookable
  if (slot.slotType === "BLOCKED") {
    throw new AppError(400, "This slot is not available for booking");
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

  // Generate confirmation token for professor approval.
  // Expiry is capped at slot start time so the token cannot be used after class begins.
  const { token, expiresAt, jti } = generateConfirmationToken(
    "", // Will be updated after booking is created
    slot.professorId,
    student.id,
    new Date(slot.startTime),
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

  // Update the token with the actual booking ID (same slot start time cap applies)
  const { token: finalToken } = generateConfirmationToken(
    booking.id,
    slot.professorId,
    student.id,
    new Date(slot.startTime),
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
    meetLink = meeting.joinUrl;
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
): Promise<BookSlotResult | WaitlistResult> {
  // Check for fully-booked group slots BEFORE the retry loop — waitlist is not a conflict
  const slotForWaitlist = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
    select: { status: true, slotType: true, maxParticipants: true, currentParticipants: true, startTime: true },
  });
  if (
    slotForWaitlist &&
    slotForWaitlist.slotType === "GROUP" &&
    (slotForWaitlist.status === "FULLY_BOOKED" ||
      slotForWaitlist.currentParticipants >= slotForWaitlist.maxParticipants)
  ) {
    // Check the slot is in the future
    if (new Date(slotForWaitlist.startTime) <= new Date()) {
      throw new AppError(400, "Cannot join waitlist for a past slot");
    }
    // Check student isn't already waitlisted
    const existing = await prisma.waitlistEntry.findUnique({
      where: { slotId_userId: { slotId, userId: student.id } },
    });
    if (existing) {
      throw new AppError(409, `You are already on the waitlist at position ${existing.position}`);
    }
    // Check student doesn't already have a booking for this slot
    const existingBooking = await prisma.booking.findFirst({
      where: { slotId, studentId: student.id, status: { notIn: ["CANCELLED_BY_STUDENT", "CANCELLED_BY_PROFESSOR", "REJECTED", "EXPIRED"] } },
    });
    if (existingBooking) {
      throw new AppError(409, "You already have a booking for this slot");
    }
    const position = (await prisma.waitlistEntry.count({ where: { slotId } })) + 1;
    await prisma.waitlistEntry.create({ data: { slotId, userId: student.id, position } });

    // Get slot details for the email
    const slotForEmail = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: { professor: { select: { id: true, email: true, firstName: true, lastName: true, isAdmin: true, timezone: true, createdAt: true, updatedAt: true } } },
    });
    if (slotForEmail) {
      sendWaitlistConfirmationToStudent({
        student,
        slot: slotForEmail as any,
        professor: slotForEmail.professor as any,
        position,
      }).catch((e: unknown) => console.error("[waitlist] email failed:", e));

      const waitlistDate = formatForNotification(slotForEmail.startTime, student.timezone);
      createNotification(
        student.id,
        "waitlist_joined",
        "Added to waitlist",
        `You're #${position} on the waitlist for ${slotForEmail.title || "Spanish Class"} on ${waitlistDate}. We'll notify you if a spot opens.`,
        "/dashboard/bookings",
      ).catch(() => {});
    }
    return { waitlisted: true, position, slotId };
  }

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

      // Fire in-app notifications (non-blocking)
      const slotTitle = slot.title || "Spanish Class";
      const classDateForStudent = formatForNotification(slot.startTime, student.timezone);
      const classDateForProfessor = formatForNotification(slot.startTime, slot.professor.timezone);
      createNotification(student.id, "booking_pending", "Booking pending confirmation", `Your booking for ${slotTitle} on ${classDateForStudent} is awaiting professor confirmation.`, "/dashboard/bookings").catch(() => {});
      createNotification(slot.professor.id, "booking_request", "New booking request", `${student.firstName} ${student.lastName} has requested to book ${slotTitle} on ${classDateForProfessor}.`, "/admin").catch(() => {});

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
        // Shaped as BookingWithSlot for the frontend's post-booking card.
        // status is always PENDING_CONFIRMATION at this point (see line 132).
        booking: {
          ...booking,
          slot: {
            ...slot,
            meetLink: slot.meetLink,
          },
        } as unknown as import("@spanish-class/shared").BookingWithSlot,
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

    const isPending = booking.status === "PENDING_CONFIRMATION";
    const isConfirmed = booking.status === "CONFIRMED";

    if (!isPending && !isConfirmed) {
      throw new AppError(400, "This booking cannot be cancelled");
    }

    // Check authorization: student can cancel their own, admin can cancel any
    const isOwner = booking.studentId === user.id;
    const isAdmin = user.isAdmin;

    if (!isOwner && !isAdmin) {
      throw new AppError(403, "You are not authorized to cancel this booking");
    }

    // Cancellation window only applies to confirmed bookings (pending requests can always be withdrawn)
    if (isConfirmed) {
      const professorSettings = await prisma.professorSettings.findUnique({
        where: { userId: booking.slot.professorId },
      });
      const windowHours = professorSettings?.cancellationWindowHours ?? 24;
      const hoursUntilStart =
        (new Date(booking.slot.startTime).getTime() - Date.now()) /
        (1000 * 60 * 60);

      if (hoursUntilStart < windowHours && !isAdmin) {
        throw new AppError(
          400,
          `Bookings must be cancelled at least ${windowHours} hour${windowHours === 1 ? "" : "s"} in advance`,
        );
      }
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

    // Promote first waitlist entry (if any) for group slots
    const nextWaiting = await tx.waitlistEntry.findFirst({
      where: { slotId: booking.slotId },
      orderBy: { position: "asc" },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, isAdmin: true, timezone: true, createdAt: true, updatedAt: true } },
      },
    });

    if (nextWaiting) {
      await tx.waitlistEntry.delete({ where: { id: nextWaiting.id } });
      // Resequence remaining entries
      const remaining = await tx.waitlistEntry.findMany({ where: { slotId: booking.slotId }, orderBy: { position: "asc" } });
      for (let i = 0; i < remaining.length; i++) {
        await tx.waitlistEntry.update({ where: { id: remaining[i].id }, data: { position: i + 1 } });
      }
    }

    return { booking, cancelledBy, promotedWaitlistEntry: nextWaiting || null };
  });

  const { booking, cancelledBy, promotedWaitlistEntry } = result;

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

  // In-app notifications for cancellation
  const slotTitle = booking.slot.title || "Spanish Class";
  if (cancelledBy === "student") {
    // Student cancelled → notify student (confirmation) + professor
    createNotification(
      booking.studentId,
      "booking_cancelled_student",
      "Booking cancelled",
      `Your booking for ${slotTitle} on ${formatForNotification(booking.slot.startTime, booking.student.timezone)} has been cancelled.`,
      "/dashboard/bookings",
    ).catch(() => {});
    createNotification(
      booking.slot.professor.id,
      "booking_cancelled_student",
      "Student cancelled a booking",
      `${booking.student.firstName} ${booking.student.lastName} cancelled their booking for ${slotTitle} on ${formatForNotification(booking.slot.startTime, booking.slot.professor.timezone)}.`,
      "/admin",
    ).catch(() => {});
  } else {
    // Professor cancelled → notify student
    createNotification(
      booking.studentId,
      "booking_cancelled_professor",
      "Booking cancelled by professor",
      `Your booking for ${slotTitle} on ${formatForNotification(booking.slot.startTime, booking.student.timezone)} was cancelled by the professor.${reason ? ` Reason: ${reason}` : ""} You can book another slot.`,
      "/dashboard/book",
    ).catch(() => {});
  }

  // If someone was promoted from the waitlist, notify them
  if (promotedWaitlistEntry) {
    const promotedStudent = promotedWaitlistEntry.user as unknown as import("@spanish-class/shared").UserPublic;
    sendWaitlistPromotionToStudent({
      student: promotedStudent,
      slot: cancelSlotForEmail,
      professor: booking.slot.professor as unknown as import("@spanish-class/shared").UserPublic,
    }).catch((e: unknown) => console.error("[waitlist] promotion email failed:", e));

    createNotification(
      promotedStudent.id,
      "waitlist_promoted",
      "A spot opened up!",
      `A spot is now available for ${booking.slot.title || "Spanish Class"} on ${formatForNotification(booking.slot.startTime, promotedStudent.timezone)}. Book now before it's taken.`,
      "/dashboard/book",
    ).catch(() => {});
  }
}
