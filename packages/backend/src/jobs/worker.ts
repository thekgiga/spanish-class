// Worker process entry point. Same image as the API; selected via the
// entrypoint's `worker` mode in packages/backend/docker/entrypoint.sh.
//
// What it does today:
//   - Starts the node-cron scheduler so booking-expiry runs hourly.
//
// What it will do as queues actually get used:
//   - Construct BullMQ Workers for `emails`, `analytics`, `booking-expiry`
//     once code starts calling queueEmail/queueAnalytics/queueBookingExpiry.
//
// The api process intentionally does NOT start the scheduler — only the
// worker runs cron, so we don't get duplicate fires when the api scales out.
import "../config/env.js";
import { startScheduler, stopScheduler } from "../lib/scheduler.js";
import { closeQueues } from "../lib/queue.js";

console.log("[worker] starting…");

startScheduler();

const shutdown = async (signal: string) => {
  console.log(`[worker] received ${signal}, shutting down`);
  try {
    stopScheduler();
    await closeQueues();
  } catch (err) {
    console.error("[worker] shutdown error:", err);
  }
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Keep the event loop alive even if scheduler hasn't queued anything yet.
setInterval(() => { /* heartbeat */ }, 60_000);

console.log("[worker] ready");
