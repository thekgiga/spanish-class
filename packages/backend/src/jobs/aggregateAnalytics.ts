import { prisma } from "../lib/prisma.js";

/**
 * Aggregate professor stats for the previous day into ProfessorDailyStats
 * and ProfessorMonthlyStats tables (J2).
 *
 * Runs daily at 01:00. Idempotent — uses upsert so re-running is safe.
 */
export async function aggregateAnalytics(): Promise<{ professorsProcessed: number }> {
  try {
    // Target = yesterday's date at midnight UTC
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setUTCDate(targetDate.getUTCDate() - 1);
    targetDate.setUTCHours(0, 0, 0, 0);

    const dayStart = new Date(targetDate);
    const dayEnd = new Date(targetDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    // Process all admin (professor) accounts
    const professors = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true },
    });

    for (const { id: professorId } of professors) {
      await aggregateDailyForProfessor(professorId, targetDate, dayStart, dayEnd);
      await aggregateMonthlyForProfessor(professorId, targetDate);
    }

    console.log(
      `[aggregateAnalytics] Processed ${professors.length} professors for ${targetDate.toISOString().split("T")[0]}`,
    );
    return { professorsProcessed: professors.length };
  } catch (error) {
    console.error("[aggregateAnalytics] Error:", error);
    throw error;
  }
}

async function aggregateDailyForProfessor(
  professorId: string,
  targetDate: Date,
  dayStart: Date,
  dayEnd: Date,
): Promise<void> {
  // Classes completed: COMPLETED bookings whose slot ended on targetDate
  const completedBookings = await prisma.booking.findMany({
    where: {
      status: "COMPLETED",
      slot: {
        professorId,
        endTime: { gte: dayStart, lte: dayEnd },
      },
    },
    select: {
      id: true,
      studentId: true,
      slotId: true,
      slot: { select: { professorId: true } },
    },
  });

  const classesCompleted = completedBookings.length;
  const uniqueStudents = new Set(completedBookings.map((b) => b.studentId)).size;

  // Earnings: sum of StudentPricing.priceRSD for each completed booking
  let totalEarningsRSD = 0;
  const studentIds = [...new Set(completedBookings.map((b) => b.studentId))];
  if (studentIds.length > 0) {
    const pricings = await prisma.studentPricing.findMany({
      where: {
        professorId,
        studentId: { in: studentIds },
      },
      select: { studentId: true, priceRSD: true },
    });
    const priceMap = new Map(pricings.map((p) => [p.studentId, p.priceRSD]));
    for (const booking of completedBookings) {
      totalEarningsRSD += priceMap.get(booking.studentId) ?? 0;
    }
  }

  // Cancelled classes on this day
  const cancelledClasses = await prisma.booking.count({
    where: {
      slot: { professorId },
      status: { in: ["CANCELLED_BY_STUDENT", "CANCELLED_BY_PROFESSOR"] },
      cancelledAt: { gte: dayStart, lte: dayEnd },
    },
  });

  // No-shows on this day
  const noShowClasses = await prisma.booking.count({
    where: {
      slot: { professorId },
      status: "NO_SHOW",
      updatedAt: { gte: dayStart, lte: dayEnd },
    },
  });

  // Average rating received on this day
  const ratings = await prisma.rating.findMany({
    where: {
      rateeId: professorId,
      createdAt: { gte: dayStart, lte: dayEnd },
    },
    select: { rating: true },
  });
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : null;

  await prisma.professorDailyStats.upsert({
    where: { professorId_date: { professorId, date: targetDate } },
    create: {
      professorId,
      date: targetDate,
      classesCompleted,
      totalEarningsRSD,
      uniqueStudents,
      cancelledClasses,
      noShowClasses,
      averageRating,
    },
    update: {
      classesCompleted,
      totalEarningsRSD,
      uniqueStudents,
      cancelledClasses,
      noShowClasses,
      averageRating,
    },
  });
}

async function aggregateMonthlyForProfessor(
  professorId: string,
  targetDate: Date,
): Promise<void> {
  const year = targetDate.getUTCFullYear();
  const month = targetDate.getUTCMonth() + 1; // 1-based

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // Sum daily stats for the month
  const dailyStats = await prisma.professorDailyStats.findMany({
    where: {
      professorId,
      date: { gte: monthStart, lte: monthEnd },
    },
  });

  const classesCompleted = dailyStats.reduce((s, d) => s + d.classesCompleted, 0);
  const totalEarningsRSD = dailyStats.reduce((s, d) => s + d.totalEarningsRSD, 0);

  // Unique students this month
  const monthlyStudents = await prisma.booking.findMany({
    where: {
      status: "COMPLETED",
      slot: {
        professorId,
        endTime: { gte: monthStart, lte: monthEnd },
      },
    },
    distinct: ["studentId"],
    select: { studentId: true },
  });
  const uniqueStudents = monthlyStudents.length;

  // Retention rate: students with >1 completed booking this month / all unique students
  let retentionRate: number | null = null;
  if (uniqueStudents > 0) {
    const studentBookingCounts = await prisma.booking.groupBy({
      by: ["studentId"],
      where: {
        status: "COMPLETED",
        slot: {
          professorId,
          endTime: { gte: monthStart, lte: monthEnd },
        },
      },
      _count: { id: true },
    });
    const returningStudents = studentBookingCounts.filter((s) => s._count.id > 1).length;
    retentionRate = Math.round((returningStudents / uniqueStudents) * 100) / 100;
  }

  // Average rating for the month
  const ratings = await prisma.rating.findMany({
    where: {
      rateeId: professorId,
      createdAt: { gte: monthStart, lte: monthEnd },
    },
    select: { rating: true },
  });
  const averageRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10
      : null;

  await prisma.professorMonthlyStats.upsert({
    where: { professorId_year_month: { professorId, year, month } },
    create: {
      professorId,
      year,
      month,
      classesCompleted,
      totalEarningsRSD,
      uniqueStudents,
      retentionRate,
      averageRating,
    },
    update: {
      classesCompleted,
      totalEarningsRSD,
      uniqueStudents,
      retentionRate,
      averageRating,
    },
  });
}
