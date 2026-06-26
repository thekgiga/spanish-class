import cron from "node-cron";
import { expirePendingBookings } from "../jobs/expirePendingBookings.js";
import { sendBookingReminders } from "../jobs/sendBookingReminders.js";

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

  isSchedulerStarted = true;
  console.log("[Scheduler] All jobs scheduled successfully");
}

export function stopScheduler(): void {
  isSchedulerStarted = false;
  console.log("[Scheduler] Scheduler stopped");
}
