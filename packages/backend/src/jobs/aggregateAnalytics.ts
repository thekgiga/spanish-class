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

    // AN3: Aggregate platform-wide daily stats
    await aggregatePlatformStats(targetDate, dayStart, dayEnd);

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

  // Average feedback rating received on this day (from SessionFeedback)
  const feedbacks = await prisma.sessionFeedback.findMany({
    where: {
      professorId,
      createdAt: { gte: dayStart, lte: dayEnd },
    },
    select: { rating: true },
  });
  const averageRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
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

  // Average feedback rating for the month (from SessionFeedback)
  const feedbacks = await prisma.sessionFeedback.findMany({
    where: {
      professorId,
      createdAt: { gte: monthStart, lte: monthEnd },
    },
    select: { rating: true },
  });
  const averageRating =
    feedbacks.length > 0
      ? Math.round((feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length) * 10) / 10
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

// ── AN3: Platform-wide daily stats ────────────────────────────────────────────

async function aggregatePlatformStats(
  targetDate: Date,
  dayStart: Date,
  dayEnd: Date,
): Promise<void> {
  // Total bookings created on targetDate
  const totalBookings = await prisma.booking.count({
    where: { bookedAt: { gte: dayStart, lte: dayEnd } },
  });

  // Completed bookings whose slot ended on targetDate
  const completedBookings = await prisma.booking.count({
    where: {
      status: "COMPLETED",
      slot: { endTime: { gte: dayStart, lte: dayEnd } },
    },
  });

  // Cancelled bookings on targetDate
  const cancelledBookings = await prisma.booking.count({
    where: {
      status: { in: ["CANCELLED_BY_STUDENT", "CANCELLED_BY_PROFESSOR"] },
      cancelledAt: { gte: dayStart, lte: dayEnd },
    },
  });

  // Active students (distinct students with any booking activity on targetDate)
  const activeStudentRows = await prisma.booking.findMany({
    where: { bookedAt: { gte: dayStart, lte: dayEnd } },
    distinct: ["studentId"],
    select: { studentId: true },
  });
  const activeStudents = activeStudentRows.length;

  // Active professors (distinct professors with at least one slot on targetDate)
  const activeProfessorRows = await prisma.availabilitySlot.findMany({
    where: { startTime: { gte: dayStart, lte: dayEnd } },
    distinct: ["professorId"],
    select: { professorId: true },
  });
  const activeProfessors = activeProfessorRows.length;

  // New user registrations on targetDate
  const newRegistrations = await prisma.user.count({
    where: { createdAt: { gte: dayStart, lte: dayEnd } },
  });

  // Total revenue from completed bookings on targetDate (via StudentPricing)
  const completedOnDay = await prisma.booking.findMany({
    where: {
      status: "COMPLETED",
      slot: { endTime: { gte: dayStart, lte: dayEnd } },
    },
    select: { studentId: true, slot: { select: { professorId: true } } },
  });

  let totalRevenueRSD = 0;
  if (completedOnDay.length > 0) {
    const pricingKeys = completedOnDay.map((b) => ({
      professorId: b.slot.professorId,
      studentId: b.studentId,
    }));
    // Batch fetch pricings
    const pricings = await prisma.studentPricing.findMany({
      where: {
        OR: pricingKeys.map((k) => ({
          professorId: k.professorId,
          studentId: k.studentId,
        })),
      },
      select: { professorId: true, studentId: true, priceRSD: true },
    });
    const priceMap = new Map(
      pricings.map((p) => [`${p.professorId}:${p.studentId}`, p.priceRSD]),
    );
    for (const b of completedOnDay) {
      totalRevenueRSD += priceMap.get(`${b.slot.professorId}:${b.studentId}`) ?? 0;
    }
  }

  await prisma.platformDailyStats.upsert({
    where: { date: targetDate },
    create: {
      date: targetDate,
      totalBookings,
      completedBookings,
      cancelledBookings,
      activeStudents,
      activeProfessors,
      newRegistrations,
      totalRevenueRSD,
    },
    update: {
      totalBookings,
      completedBookings,
      cancelledBookings,
      activeStudents,
      activeProfessors,
      newRegistrations,
      totalRevenueRSD,
    },
  });
}
