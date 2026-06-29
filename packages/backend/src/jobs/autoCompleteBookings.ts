import { prisma } from "../lib/prisma.js";
import type { BookingStatus } from "@prisma/client";
import { incrementEngagementStat } from "../services/studentEngagement.js";
import { createNotification } from "../services/notifications.js";

const TERMINAL_STATUSES: BookingStatus[] = [
  "COMPLETED",
  "CANCELLED_BY_STUDENT",
  "CANCELLED_BY_PROFESSOR",
  "REJECTED",
  "EXPIRED",
  "NO_SHOW",
];

/**
 * Auto-complete CONFIRMED bookings whose slot has ended (B10).
 * Runs hourly. Also marks slots as COMPLETED when all bookings are terminal.
 * Triggers a feedback_pending notification for each completed booking
 * if the student hasn't already submitted feedback.
 */
export async function autoCompleteBookings(): Promise<{ completedCount: number }> {
  try {
    const now = new Date();

    // Find all CONFIRMED bookings where the slot has already ended
    const bookingsToComplete = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        slot: { endTime: { lt: now } },
      },
      select: {
        id: true,
        slotId: true,
        studentId: true,
        slot: {
          select: {
            title: true,
            startTime: true,
            professorId: true,
          },
        },
      },
    });

    if (bookingsToComplete.length === 0) {
      return { completedCount: 0 };
    }

    // Batch update to COMPLETED
    const result = await prisma.booking.updateMany({
      where: { id: { in: bookingsToComplete.map((b) => b.id) } },
      data: { status: "COMPLETED" },
    });

    // AN2: Update StudentEngagementStats.totalClassesAttended (non-blocking)
    const studentIds = [...new Set(bookingsToComplete.map((b) => b.studentId).filter(Boolean))];
    for (const studentId of studentIds) {
      incrementEngagementStat(studentId, "totalClassesAttended").catch(() => {});
    }

    // Trigger feedback_pending notification for each booking (non-blocking)
    for (const booking of bookingsToComplete) {
      // Check if feedback already submitted
      const feedbackExists = await prisma.sessionFeedback.findUnique({
        where: { bookingId: booking.id },
      }).catch(() => null);

      if (!feedbackExists) {
        const sessionDate = new Date(booking.slot.startTime).toLocaleDateString("en", {
          month: "short", day: "numeric",
        });
        const classTitle = booking.slot.title || "Spanish Class";
        createNotification(
          booking.studentId,
          "feedback_pending",
          "How was your class?",
          `Share feedback for "${classTitle}" on ${sessionDate}. It only takes a minute and helps your professor improve.`,
          `/dashboard/feedback/${booking.id}`,
        ).catch(() => {});
      }
    }

    // Mark slot as COMPLETED if no remaining active bookings
    const uniqueSlotIds = [...new Set(bookingsToComplete.map((b) => b.slotId))];

    for (const slotId of uniqueSlotIds) {
      const activeCount = await prisma.booking.count({
        where: {
          slotId,
          status: { notIn: TERMINAL_STATUSES },
        },
      });
      if (activeCount === 0) {
        await prisma.availabilitySlot.update({
          where: { id: slotId },
          data: { status: "COMPLETED" },
        });
      }
    }

    console.log(`[autoCompleteBookings] Completed ${result.count} bookings`);
    return { completedCount: result.count };
  } catch (error) {
    console.error("[autoCompleteBookings] Error:", error);
    throw error;
  }
}
