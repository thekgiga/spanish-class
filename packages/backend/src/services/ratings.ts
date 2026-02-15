import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";
import type { Rating, UserRatingsSummary } from "@spanish-class/shared";

/**
 * Create a rating (T112)
 */
export async function createRating(
  raterId: string,
  rateeId: string,
  rating: number,
  comment?: string,
  bookingId?: string,
  isAnonymous: boolean = false,
): Promise<Rating> {
  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new AppError(400, "Rating must be between 1 and 5");
  }

  // Prevent self-rating
  if (raterId === rateeId) {
    throw new AppError(400, "You cannot rate yourself");
  }

  // If booking specified, verify it exists and involves both users
  if (bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true },
    });

    if (!booking) {
      throw new AppError(404, "Booking not found");
    }

    const isStudent = booking.studentId === raterId;
    const isProfessor = booking.slot.professorId === raterId;

    if (!isStudent && !isProfessor) {
      throw new AppError(403, "You are not part of this booking");
    }

    // Check if already rated for this booking
    const existingRating = await prisma.rating.findFirst({
      where: {
        raterId,
        rateeId,
        bookingId,
      },
    });

    if (existingRating) {
      throw new AppError(400, "You have already rated this booking");
    }
  }

  // Create rating
  const newRating = await prisma.rating.create({
    data: {
      raterId,
      rateeId,
      rating,
      comment,
      bookingId,
      isAnonymous,
    },
  });

  return newRating as unknown as Rating;
}

/**
 * Get ratings for a user (T114)
 */
export async function getUserRatings(userId: string): Promise<UserRatingsSummary> {
  const ratings = await prisma.rating.findMany({
    where: { rateeId: userId },
    include: {
      rater: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isAdmin: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalRatings: ratings.length,
    ratings: ratings.map((r) => ({
      ...r,
      rater: r.isAnonymous
        ? {
            ...r.rater,
            firstName: "Anonymous",
            lastName: "",
            email: "",
          }
        : r.rater,
    })) as any,
  };
}

/**
 * Get pending ratings for a user (T115)
 */
export async function getPendingRatings(userId: string): Promise<any[]> {
  // Get completed bookings where user hasn't rated yet
  const completedBookings = await prisma.booking.findMany({
    where: {
      OR: [
        { studentId: userId },
        { slot: { professorId: userId } },
      ],
      status: "COMPLETED",
    },
    include: {
      slot: {
        include: {
          professor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isAdmin: true,
              timezone: true,
              createdAt: true,
              updatedAt: true,
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
          isAdmin: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  // Filter out bookings already rated
  const pendingRatings = [];

  for (const booking of completedBookings) {
    const isStudent = booking.studentId === userId;
    const rateeId = isStudent ? booking.slot.professorId : booking.studentId;

    const existingRating = await prisma.rating.findFirst({
      where: {
        raterId: userId,
        rateeId,
        bookingId: booking.id,
      },
    });

    if (!existingRating) {
      pendingRatings.push({
        bookingId: booking.id,
        rateeId,
        rateeName: isStudent
          ? `${booking.slot.professor.firstName} ${booking.slot.professor.lastName}`
          : `${booking.student.firstName} ${booking.student.lastName}`,
        classDate: booking.slot.startTime,
      });
    }
  }

  return pendingRatings;
}
