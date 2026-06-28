import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";
import { markAllRead } from "./notifications.js";

/**
 * Submit feedback for a completed session.
 * One feedback per booking (enforced by unique constraint on bookingId).
 * Marks any pending feedback notifications as read after submission.
 */
export async function submitFeedback(
  bookingId: string,
  studentId: string,
  rating: number,
  whatWasGood?: string,
  whatCouldBeImproved?: string,
) {
  if (rating < 1 || rating > 5) {
    throw new AppError(400, "Rating must be between 1 and 5");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: { select: { professorId: true } } },
  });

  if (!booking) throw new AppError(404, "Booking not found");
  if (booking.studentId !== studentId) throw new AppError(403, "This is not your booking");
  if (booking.status !== "COMPLETED") throw new AppError(400, "Feedback can only be submitted for completed sessions");

  const existing = await prisma.sessionFeedback.findUnique({ where: { bookingId } });
  if (existing) throw new AppError(409, "Feedback already submitted for this session");

  const feedback = await prisma.sessionFeedback.create({
    data: {
      bookingId,
      studentId,
      professorId: booking.slot.professorId,
      rating,
      whatWasGood: whatWasGood?.trim() || null,
      whatCouldBeImproved: whatCouldBeImproved?.trim() || null,
    },
  });

  // Mark the feedback_pending notification as read for this student
  await prisma.notification.updateMany({
    where: {
      userId: studentId,
      type: "feedback_pending",
      href: `/dashboard/feedback/${bookingId}`,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return feedback;
}

/**
 * Get paginated feedback for a professor's sessions.
 * Includes student name and session date for display.
 */
export async function getProfessorFeedback(
  professorId: string,
  page = 1,
  limit = 20,
  studentId?: string,
) {
  const where = {
    professorId,
    ...(studentId ? { studentId } : {}),
  };

  const [feedbackList, total] = await Promise.all([
    prisma.sessionFeedback.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        booking: {
          include: {
            slot: { select: { title: true, startTime: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sessionFeedback.count({ where }),
  ]);

  const avgResult = await prisma.sessionFeedback.aggregate({
    where: { professorId },
    _avg: { rating: true },
  });

  return {
    feedback: feedbackList,
    total,
    totalPages: Math.ceil(total / limit),
    avgRating: avgResult._avg.rating ? Math.round(avgResult._avg.rating * 10) / 10 : null,
  };
}

/**
 * Get summary of feedback grouped by professor (for admin school-owner view).
 * Returns each professor with their avg rating, total count, and 3 most recent entries.
 */
export async function getAdminFeedbackSummary() {
  const professors = await prisma.user.findMany({
    where: { isAdmin: true, deletedAt: null },
    select: { id: true, firstName: true, lastName: true },
  });

  const summaries = await Promise.all(
    professors.map(async (prof) => {
      const [total, aggResult, recent] = await Promise.all([
        prisma.sessionFeedback.count({ where: { professorId: prof.id } }),
        prisma.sessionFeedback.aggregate({
          where: { professorId: prof.id },
          _avg: { rating: true },
        }),
        prisma.sessionFeedback.findMany({
          where: { professorId: prof.id },
          include: {
            student: { select: { firstName: true, lastName: true } },
            booking: { include: { slot: { select: { title: true, startTime: true } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
      ]);

      return {
        professorId: prof.id,
        professorName: `${prof.firstName} ${prof.lastName}`,
        totalFeedback: total,
        avgRating: aggResult._avg.rating ? Math.round(aggResult._avg.rating * 10) / 10 : null,
        recentFeedback: recent,
      };
    }),
  );

  return summaries.filter((s) => s.totalFeedback > 0 || professors.length <= 5);
}

/**
 * Check if feedback has already been submitted for a specific booking.
 */
export async function getBookingFeedback(bookingId: string) {
  return prisma.sessionFeedback.findUnique({
    where: { bookingId },
    include: {
      student: { select: { firstName: true, lastName: true } },
      booking: { include: { slot: { select: { title: true, startTime: true } } } },
    },
  });
}
