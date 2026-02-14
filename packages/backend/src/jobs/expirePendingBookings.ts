import { prisma } from "../lib/prisma.js";

/**
 * Expire pending bookings that have exceeded the 48-hour confirmation window (T045)
 * This job should run hourly to clean up expired pending bookings
 */
export async function expirePendingBookings(): Promise<{
  expiredCount: number;
}> {
  try {
    const now = new Date();

    // Find all pending bookings where confirmation has expired
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING_CONFIRMATION",
        confirmationExpiresAt: {
          lt: now, // Less than current time = expired
        },
      },
    });

    if (expiredBookings.length === 0) {
      return { expiredCount: 0 };
    }

    // Update all expired bookings to EXPIRED status
    const result = await prisma.booking.updateMany({
      where: {
        id: {
          in: expiredBookings.map((b) => b.id),
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    console.log(
      `[expirePendingBookings] Expired ${result.count} pending bookings`,
    );

    return { expiredCount: result.count };
  } catch (error) {
    console.error("[expirePendingBookings] Error:", error);
    throw error;
  }
}
