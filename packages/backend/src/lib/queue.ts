import { Queue, Worker, QueueEvents } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Parse Redis URL for connection options
const redisOpts = {
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
};

// Email queue for async email sending
export const emailQueue = new Queue("emails", {
  connection: redisOpts,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Analytics queue for periodic aggregation
export const analyticsQueue = new Queue("analytics", {
  connection: redisOpts,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600,
      count: 100,
    },
    removeOnFail: {
      age: 7 * 24 * 3600,
    },
  },
});

// Booking expiry queue for cleaning up expired pending bookings
export const bookingExpiryQueue = new Queue("booking-expiry", {
  connection: redisOpts,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "fixed",
      delay: 60000, // 1 minute
    },
    removeOnComplete: {
      age: 3600, // 1 hour
      count: 100,
    },
    removeOnFail: {
      age: 24 * 3600,
    },
  },
});

// Queue events for monitoring
export const emailQueueEvents = new QueueEvents("emails", {
  connection: redisOpts,
});
export const analyticsQueueEvents = new QueueEvents("analytics", {
  connection: redisOpts,
});
export const bookingExpiryQueueEvents = new QueueEvents("booking-expiry", {
  connection: redisOpts,
});

// Email job types
export interface SendEmailJob {
  type:
    | "confirmation_request"
    | "booking_confirmed"
    | "booking_rejected"
    | "booking_pending";
  to: string;
  subject: string;
  html: string;
  metadata?: Record<string, any>;
}

// Analytics job types
export interface AnalyticsJob {
  type:
    | "aggregate_daily"
    | "aggregate_monthly"
    | "update_student_engagement"
    | "update_platform_stats";
  date?: string;
  professorId?: string;
  studentId?: string;
}

// Booking expiry job types
export interface BookingExpiryJob {
  type: "expire_pending_bookings";
  cutoffTime: string;
}

/**
 * Add an email to the queue
 */
export async function queueEmail(job: SendEmailJob): Promise<void> {
  await emailQueue.add(job.type, job, {
    priority: job.type === "confirmation_request" ? 1 : 2, // Confirmation requests are high priority
  });
}

/**
 * Add an analytics job to the queue
 */
export async function queueAnalytics(job: AnalyticsJob): Promise<void> {
  await analyticsQueue.add(job.type, job);
}

/**
 * Add a booking expiry job to the queue
 */
export async function queueBookingExpiry(job: BookingExpiryJob): Promise<void> {
  await bookingExpiryQueue.add(job.type, job);
}

/**
 * Gracefully close all queue connections
 */
export async function closeQueues(): Promise<void> {
  await emailQueue.close();
  await analyticsQueue.close();
  await bookingExpiryQueue.close();
}
