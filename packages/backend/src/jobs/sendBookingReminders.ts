import type { AvailabilitySlot } from "@spanish-class/shared";
import type { UserPublic } from "@spanish-class/shared";
import { prisma } from "../lib/prisma.js";
import { sendConfirmationRequestToProfessor } from "../services/email.js";

const REMINDER_WINDOW_HOURS = 6; // Send reminder when ≤ this many hours until expiry

export async function sendBookingReminders(): Promise<{ remindersSent: number }> {
  const now = new Date();
  const cutoff = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

  const pendingBookings = await prisma.booking.findMany({
    where: {
      status: "PENDING_CONFIRMATION",
      reminderSentAt: null,
      confirmationExpiresAt: {
        // expires between now and cutoff — approaching deadline
        gt: now,
        lte: cutoff,
      },
    },
    include: {
      slot: { include: { professor: true } },
      student: true,
    },
  });

  if (pendingBookings.length === 0) {
    return { remindersSent: 0 };
  }

  let remindersSent = 0;

  for (const booking of pendingBookings) {
    try {
      if (!booking.confirmationToken || !booking.confirmationExpiresAt) continue;

      await sendConfirmationRequestToProfessor(
        {
          slot: booking.slot as unknown as AvailabilitySlot,
          professor: booking.slot.professor as unknown as UserPublic,
          student: booking.student as unknown as UserPublic,
          confirmationToken: booking.confirmationToken,
          expiresAt: booking.confirmationExpiresAt,
        },
        { isReminder: true },
      );

      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSentAt: now },
      });

      remindersSent++;
    } catch (err) {
      console.error(`[sendBookingReminders] Failed for booking ${booking.id}:`, err);
    }
  }

  console.log(`[sendBookingReminders] Sent ${remindersSent}/${pendingBookings.length} reminders`);
  return { remindersSent };
}
