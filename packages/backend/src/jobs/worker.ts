// Worker process entry point. Same image as the API; selected via the
// entrypoint's `worker` mode in packages/backend/docker/entrypoint.sh.
//
// Responsibilities:
//   - Runs all cron-scheduled jobs (via node-cron scheduler)
//   - Processes the BullMQ email queue for reliable retry delivery (J8)
//   - Exposes a lightweight HTTP health endpoint on WORKER_HEALTH_PORT (J7)
//
// The api process intentionally does NOT start the scheduler — only the
// worker runs cron, so we don't get duplicate fires when the api scales out.
import "../config/env.js";
import http from "http";
import { Resend } from "resend";
import { Worker } from "bullmq";
import { startScheduler, stopScheduler, isSchedulerActive } from "../lib/scheduler.js";
import { closeQueues } from "../lib/queue.js";
import { resend as sharedResend, isLiveKey, EMAIL_FROM } from "../services/email.js";
import type { SendEmailJob } from "../lib/queue.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const WORKER_HEALTH_PORT = parseInt(process.env.WORKER_HEALTH_PORT || "3001", 10);

function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    maxRetriesPerRequest: null,
  };
}

const redisOpts = parseRedisUrl(REDIS_URL);

const startedAt = new Date();

console.log("[worker] starting…");

// ── BullMQ Email Worker (J8) ──────────────────────────────────────────────────
// Processes jobs placed on the emailQueue by email.ts when Resend fails.
// The queue is configured with 3 attempts + exponential backoff in queue.ts.

const emailBullWorker = new Worker<SendEmailJob>(
  "emails",
  async (job) => {
    const { to, subject, html } = job.data;

    if (!isLiveKey) {
      console.log(`[email-worker] mock send to=${to} subject=${JSON.stringify(subject)}`);
      return;
    }

    const resendClient = new Resend(process.env.RESEND_API_KEY!);
    const { error } = await resendClient.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    if (error) throw new Error(error.message);
  },
  { connection: redisOpts, concurrency: 5 },
);

emailBullWorker.on("completed", (job) => {
  console.log(`[email-worker] Job ${job.id} (${job.data.type}) delivered successfully`);
});

emailBullWorker.on("failed", (job, err) => {
  console.error(
    `[email-worker] Job ${job?.id} (${job?.data.type}) failed after ${job?.attemptsMade} attempts:`,
    err.message,
  );
});

// ── Cron Scheduler ────────────────────────────────────────────────────────────
startScheduler();

// ── Health Server (J7) ────────────────────────────────────────────────────────
const REGISTERED_JOBS = [
  "expirePendingBookings",
  "sendBookingReminders",
  "autoCompleteBookings",
  "aggregateAnalytics",
  "sendClassReminders",
  "cleanupStaleData",
];

const healthServer = http.createServer((req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    const payload = JSON.stringify({
      status: "ok",
      uptime: Math.floor((Date.now() - startedAt.getTime()) / 1000),
      scheduler: isSchedulerActive(),
      emailWorker: !emailBullWorker.isRunning() ? "stopped" : "running",
      jobs: REGISTERED_JOBS,
      timestamp: new Date().toISOString(),
    });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(payload);
  } else {
    res.writeHead(404);
    res.end();
  }
});

healthServer.listen(WORKER_HEALTH_PORT, () => {
  console.log(`[worker] health endpoint listening on :${WORKER_HEALTH_PORT}/health`);
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`[worker] received ${signal}, shutting down`);
  try {
    stopScheduler();
    await emailBullWorker.close();
    await closeQueues();
    healthServer.close();
  } catch (err) {
    console.error("[worker] shutdown error:", err);
  }
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Keep the event loop alive even if no jobs are scheduled yet.
setInterval(() => { /* heartbeat */ }, 60_000);

console.log("[worker] ready");
