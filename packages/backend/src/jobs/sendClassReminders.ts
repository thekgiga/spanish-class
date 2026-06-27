import type { AvailabilitySlot, UserPublic } from "@spanish-class/shared";
import { prisma } from "../lib/prisma.js";
import { sendClassReminderToStudent } from "../services/email.js";
import { createNotification } from "../services/notifications.js";

/**
 * Send class-start reminder emails and in-app notifications to students.
 * Two passes: 24h before class (J3) and 1h before class (J4).
 * Runs every 30 minutes. Uses reminderSent24h / reminderSent1h flags to prevent duplicates.
 */
export async function sendClassReminders(): Promise<{ sent24h: number; sent1h: number }> {
  try {
    const now = new Date();
    let sent24h = 0;
    let sent1h = 0;

    // ── Pass A: 24h reminder ─────────────────────────────────────────────────
    const window24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const window24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const bookings24h = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        reminderSent24h: null,
        slot: { startTime: { gte: window24hStart, lte: window24hEnd } },
      },
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

    for (const booking of bookings24h) {
      try {
        const slotForEmail = booking.slot as unknown as AvailabilitySlot;
        const professorForEmail = booking.slot.professor as unknown as UserPublic;
        const studentForEmail = booking.student as unknown as UserPublic;

        await sendClassReminderToStudent({
          slot: slotForEmail,
          professor: professorForEmail,
          student: studentForEmail,
          hoursUntil: 24,
        });

        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent24h: now },
        });

        createNotification(
          booking.studentId,
          "class_reminder_24h",
          "Class starts in 24 hours",
          `Your class "${booking.slot.title || "Spanish Class"}" starts tomorrow. Don't forget!`,
          "/dashboard/bookings",
        ).catch(() => {});

        sent24h++;
      } catch (err) {
        console.error(`[sendClassReminders] 24h reminder failed for booking ${booking.id}:`, err);
      }
    }

    // ── Pass B: 1h reminder ──────────────────────────────────────────────────
    const window1hStart = new Date(now.getTime() + 45 * 60 * 1000);
    const window1hEnd = new Date(now.getTime() + 75 * 60 * 1000);

    const bookings1h = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        reminderSent1h: null,
        slot: { startTime: { gte: window1hStart, lte: window1hEnd } },
      },
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

    for (const booking of bookings1h) {
      try {
        const slotForEmail = booking.slot as unknown as AvailabilitySlot;
        const professorForEmail = booking.slot.professor as unknown as UserPublic;
        const studentForEmail = booking.student as unknown as UserPublic;

        await sendClassReminderToStudent({
          slot: slotForEmail,
          professor: professorForEmail,
          student: studentForEmail,
          hoursUntil: 1,
        });

        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent1h: now },
        });

        createNotification(
          booking.studentId,
          "class_reminder_1h",
          "Class starts in 1 hour",
          `Your class "${booking.slot.title || "Spanish Class"}" starts in about an hour. Get ready!`,
          "/dashboard/bookings",
        ).catch(() => {});

        sent1h++;
      } catch (err) {
        console.error(`[sendClassReminders] 1h reminder failed for booking ${booking.id}:`, err);
      }
    }

    if (sent24h > 0 || sent1h > 0) {
      console.log(`[sendClassReminders] Sent ${sent24h} × 24h and ${sent1h} × 1h reminders`);
    }
    return { sent24h, sent1h };
  } catch (error) {
    console.error("[sendClassReminders] Error:", error);
    throw error;
  }
}
