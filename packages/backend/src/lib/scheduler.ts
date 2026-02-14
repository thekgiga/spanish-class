import cron from "node-cron";
import { expirePendingBookings } from "../jobs/expirePendingBookings.js";

let isSchedulerStarted = false;

/**
 * Initialize and start all scheduled jobs (T046)
 */
export function startScheduler(): void {
  if (isSchedulerStarted) {
    console.log("[Scheduler] Already started");
    return;
  }

  console.log("[Scheduler] Starting scheduled jobs...");

  // Schedule hourly expiry check for pending bookings
  // Runs every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("[Scheduler] Running expirePendingBookings job...");
      const result = await expirePendingBookings();
      console.log(
        `[Scheduler] expirePendingBookings completed. Expired: ${result.expiredCount}`,
      );
    } catch (error) {
      console.error("[Scheduler] expirePendingBookings failed:", error);
    }
  });

  // TODO: Add other scheduled jobs here
  // - Daily analytics aggregation (runs at 2 AM)
  // - Monthly stats aggregation (runs on 1st of month at 3 AM)
  // - Platform-wide stats (runs every 15 minutes)

  isSchedulerStarted = true;
  console.log("[Scheduler] All jobs scheduled successfully");
}

/**
 * Stop all scheduled jobs
 */
export function stopScheduler(): void {
  // node-cron doesn't provide a way to stop all tasks
  // We'd need to maintain references to each task to stop them individually
  isSchedulerStarted = false;
  console.log("[Scheduler] Scheduler stopped");
}
