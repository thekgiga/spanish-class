import { prisma } from "../lib/prisma.js";

/**
 * Increment a counter field on StudentEngagementStats.
 * Creates the record with default zeros if it doesn't exist yet (upsert).
 * Called non-blocking (.catch(() => {})) from booking and completion flows.
 */
export async function incrementEngagementStat(
  studentId: string,
  field: "totalClassesBooked" | "totalClassesAttended" | "totalClassesCancelled",
  lastBookingDate?: Date,
): Promise<void> {
  const updateData = {
    [field]: { increment: 1 },
    ...(lastBookingDate ? { lastBookingDate } : {}),
  };

  // Build create data with only the incremented field set to 1
  const createBase = {
    studentId,
    totalClassesBooked: 0,
    totalClassesAttended: 0,
    totalClassesCancelled: 0,
    noShowCount: 0,
  };

  if (field === "totalClassesBooked") {
    await prisma.studentEngagementStats.upsert({
      where: { studentId },
      update: updateData,
      create: { ...createBase, totalClassesBooked: 1, ...(lastBookingDate ? { lastBookingDate } : {}) },
    });
  } else if (field === "totalClassesAttended") {
    await prisma.studentEngagementStats.upsert({
      where: { studentId },
      update: updateData,
      create: { ...createBase, totalClassesAttended: 1 },
    });
  } else {
    await prisma.studentEngagementStats.upsert({
      where: { studentId },
      update: updateData,
      create: { ...createBase, totalClassesCancelled: 1 },
    });
  }
}

/**
 * Recompute and store the average rating given by a student across all their ratings.
 * Called non-blocking after a student submits a new rating.
 */
export async function updateAverageRatingGiven(studentId: string): Promise<void> {
  const agg = await prisma.rating.aggregate({
    where: { raterId: studentId },
    _avg: { rating: true },
  });

  const avg = agg._avg.rating ?? null;

  await prisma.studentEngagementStats.upsert({
    where: { studentId },
    update: { averageRatingGiven: avg },
    create: {
      studentId,
      totalClassesBooked: 0,
      totalClassesAttended: 0,
      totalClassesCancelled: 0,
      noShowCount: 0,
      averageRatingGiven: avg,
    },
  });
}
