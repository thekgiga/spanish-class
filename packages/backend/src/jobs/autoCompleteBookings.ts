import { prisma } from "../lib/prisma.js";
import type { BookingStatus } from "@prisma/client";

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
      select: { id: true, slotId: true },
    });

    if (bookingsToComplete.length === 0) {
      return { completedCount: 0 };
    }

    // Batch update to COMPLETED
    const result = await prisma.booking.updateMany({
      where: { id: { in: bookingsToComplete.map((b) => b.id) } },
      data: { status: "COMPLETED" },
    });

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
