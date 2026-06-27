import cron from "node-cron";
import { expirePendingBookings } from "../jobs/expirePendingBookings.js";
import { sendBookingReminders } from "../jobs/sendBookingReminders.js";
import { autoCompleteBookings } from "../jobs/autoCompleteBookings.js";
import { aggregateAnalytics } from "../jobs/aggregateAnalytics.js";
import { sendClassReminders } from "../jobs/sendClassReminders.js";
import { cleanupStaleData } from "../jobs/cleanupStaleData.js";

let isSchedulerStarted = false;

export function startScheduler(): void {
  if (isSchedulerStarted) {
    console.log("[Scheduler] Already started");
    return;
  }

  console.log("[Scheduler] Starting scheduled jobs...");

  // Hourly: expire pending bookings that missed the confirmation window
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("[Scheduler] Running expirePendingBookings...");
      const result = await expirePendingBookings();
      console.log(`[Scheduler] expirePendingBookings done. Expired: ${result.expiredCount}`);
    } catch (error) {
      console.error("[Scheduler] expirePendingBookings failed:", error);
    }
  });

  // Every 2 hours: send reminders for bookings approaching their confirmation deadline
  cron.schedule("0 */2 * * *", async () => {
    try {
      console.log("[Scheduler] Running sendBookingReminders...");
      const result = await sendBookingReminders();
      console.log(`[Scheduler] sendBookingReminders done. Sent: ${result.remindersSent}`);
    } catch (error) {
      console.error("[Scheduler] sendBookingReminders failed:", error);
    }
  });

  // Every hour at :30: auto-complete confirmed bookings whose slot has ended (B10)
  cron.schedule("30 * * * *", async () => {
    try {
      console.log("[Scheduler] Running autoCompleteBookings...");
      const result = await autoCompleteBookings();
      console.log(`[Scheduler] autoCompleteBookings done. Completed: ${result.completedCount}`);
    } catch (error) {
      console.error("[Scheduler] autoCompleteBookings failed:", error);
    }
  });

  // Every 30 minutes: send 24h and 1h class-start reminders to students (J3, J4)
  cron.schedule("*/30 * * * *", async () => {
    try {
      const result = await sendClassReminders();
      if (result.sent24h > 0 || result.sent1h > 0) {
        console.log(`[Scheduler] sendClassReminders done. 24h: ${result.sent24h}, 1h: ${result.sent1h}`);
      }
    } catch (error) {
      console.error("[Scheduler] sendClassReminders failed:", error);
    }
  });

  // Daily at 01:00: aggregate professor analytics stats (J2)
  cron.schedule("0 1 * * *", async () => {
    try {
      console.log("[Scheduler] Running aggregateAnalytics...");
      const result = await aggregateAnalytics();
      console.log(`[Scheduler] aggregateAnalytics done. Professors: ${result.professorsProcessed}`);
    } catch (error) {
      console.error("[Scheduler] aggregateAnalytics failed:", error);
    }
  });

  // Daily at 02:00: cleanup stale waitlist entries and old notifications (J5, J6)
  cron.schedule("0 2 * * *", async () => {
    try {
      console.log("[Scheduler] Running cleanupStaleData...");
      const result = await cleanupStaleData();
      console.log(`[Scheduler] cleanupStaleData done. Waitlist: ${result.waitlistEntriesDeleted}, Notifications: ${result.notificationsDeleted}`);
    } catch (error) {
      console.error("[Scheduler] cleanupStaleData failed:", error);
    }
  });

  isSchedulerStarted = true;
  console.log("[Scheduler] All jobs scheduled successfully");
}

export function stopScheduler(): void {
  isSchedulerStarted = false;
  console.log("[Scheduler] Scheduler stopped");
}

export function isSchedulerActive(): boolean {
  return isSchedulerStarted;
}

