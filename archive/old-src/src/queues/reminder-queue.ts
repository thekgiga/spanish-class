import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { prisma } from '../lib/prisma.js';
import { sendClassReminder } from '../services/email.js';

interface ReminderJob {
  bookingId: string;
  slotId: string;
  studentId: string;
}

// Create reminder queue
export const reminderQueue = new Queue<ReminderJob>('class-reminders', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
      age: 7 * 24 * 3600, // Keep for 7 days
    },
  },
});

// Worker to process reminder jobs
export const reminderWorker = new Worker<ReminderJob>(
  'class-reminders',
  async (job) => {
    const { bookingId, slotId, studentId } = job.data;

    // Fetch booking with slot and user details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: {
          include: {
            professor: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                timezone: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            timezone: true,
          },
        },
      },
    });

    if (!booking || booking.status !== 'CONFIRMED') {
      console.log(`Skipping reminder for booking ${bookingId} - not confirmed`);
      return;
    }

    // Send reminder email
    await sendClassReminder({
      booking,
      slot: booking.slot,
      student: booking.student,
      professor: booking.slot.professor,
    });

    console.log(`Sent reminder for booking ${bookingId}`);
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

reminderWorker.on('completed', (job) => {
  console.log(`Reminder job ${job.id} completed`);
});

reminderWorker.on('failed', (job, err) => {
  console.error(`Reminder job ${job?.id} failed:`, err);
});

/**
 * Schedule a reminder for a class 2 hours before it starts
 */
export async function scheduleClassReminder(
  bookingId: string,
  slotId: string,
  studentId: string,
  classStartTime: Date
): Promise<void> {
  const reminderTime = new Date(classStartTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
  const now = new Date();

  // Only schedule if reminder time is in the future
  if (reminderTime > now) {
    await reminderQueue.add(
      'send-reminder',
      { bookingId, slotId, studentId },
      {
        delay: reminderTime.getTime() - now.getTime(),
        jobId: `reminder-${bookingId}`, // Prevent duplicates
      }
    );
    console.log(`Scheduled reminder for booking ${bookingId} at ${reminderTime.toISOString()}`);
  }
}

/**
 * Cancel a scheduled reminder
 */
export async function cancelClassReminder(bookingId: string): Promise<void> {
  const jobId = `reminder-${bookingId}`;
  const job = await reminderQueue.getJob(jobId);
  if (job) {
    await job.remove();
    console.log(`Cancelled reminder for booking ${bookingId}`);
  }
}
