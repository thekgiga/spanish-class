import { prisma } from "../lib/prisma.js";

/**
 * Clean up stale data:
 *   J5 — Delete waitlist entries for slots that have already started (past-date cleanup)
 *   J6 — Delete read notifications older than 30 days
 *
 * Runs daily at 02:00.
 */
export async function cleanupStaleData(): Promise<{
  waitlistEntriesDeleted: number;
  notificationsDeleted: number;
}> {
  try {
    const now = new Date();

    // J5: Remove waitlist entries for past slots OR cancelled slots (W2)
    const waitlistResult = await prisma.waitlistEntry.deleteMany({
      where: {
        OR: [
          { slot: { startTime: { lt: now } } },
          { slot: { status: "CANCELLED" } },
        ],
      },
    });

    // J6: Remove read notifications older than 30 days
    const notificationCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const notificationResult = await prisma.notification.deleteMany({
      where: {
        readAt: { not: null },
        createdAt: { lt: notificationCutoff },
      },
    });

    console.log(
      `[cleanupStaleData] Deleted ${waitlistResult.count} stale waitlist entries, ` +
        `${notificationResult.count} old notifications`,
    );
    return {
      waitlistEntriesDeleted: waitlistResult.count,
      notificationsDeleted: notificationResult.count,
    };
  } catch (error) {
    console.error("[cleanupStaleData] Error:", error);
    throw error;
  }
}
