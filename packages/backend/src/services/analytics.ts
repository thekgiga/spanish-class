import { prisma } from "../lib/prisma.js";
import type {
  ProfessorDailyStats,
  ProfessorMonthlyStats,
  StudentEngagementStats,
  PlatformDailyStats,
} from "@spanish-class/shared";

/**
 * Get professor analytics for a date range (T092)
 */
export async function getProfessorAnalytics(
  professorId: string,
  startDate: Date,
  endDate: Date,
): Promise<{
  daily: ProfessorDailyStats[];
  monthly: ProfessorMonthlyStats[];
  summary: {
    totalEarnings: number;
    totalClasses: number;
    averageRating: number;
    uniqueStudents: number;
  };
}> {
  // Get daily stats
  const dailyStats = await prisma.professorDailyStats.findMany({
    where: {
      professorId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  });

  // Get monthly stats
  const monthlyStats = await prisma.professorMonthlyStats.findMany({
    where: { professorId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: 12,
  });

  // Calculate summary
  const totalEarnings = dailyStats.reduce((sum, s) => sum + s.totalEarningsRSD, 0);
  const totalClasses = dailyStats.reduce((sum, s) => sum + s.classesCompleted, 0);
  const avgRating =
    dailyStats.filter((s) => s.averageRating !== null).reduce((sum, s) => sum + (s.averageRating || 0), 0) /
    dailyStats.filter((s) => s.averageRating !== null).length || 0;

  // Get unique students
  const uniqueStudentsCount = await prisma.booking.findMany({
    where: {
      slot: { professorId },
      status: "COMPLETED",
    },
    distinct: ["studentId"],
    select: { studentId: true },
  });

  return {
    daily: dailyStats as unknown as ProfessorDailyStats[],
    monthly: monthlyStats as unknown as ProfessorMonthlyStats[],
    summary: {
      totalEarnings,
      totalClasses,
      averageRating: Math.round(avgRating * 10) / 10,
      uniqueStudents: uniqueStudentsCount.length,
    },
  };
}

/**
 * Get student engagement stats (T092)
 */
export async function getStudentEngagementStats(
  studentId: string,
): Promise<StudentEngagementStats | null> {
  const stats = await prisma.studentEngagementStats.findUnique({
    where: { studentId },
  });

  return stats as unknown as StudentEngagementStats | null;
}

/**
 * Get platform-wide analytics (T092)
 */
export async function getPlatformAnalytics(
  startDate: Date,
  endDate: Date,
): Promise<{
  daily: PlatformDailyStats[];
  summary: {
    totalRevenue: number;
    totalBookings: number;
    activeUsers: number;
    growthRate: number;
  };
}> {
  const dailyStats = await prisma.platformDailyStats.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  });

  const totalRevenue = dailyStats.reduce((sum, s) => sum + s.totalRevenueRSD, 0);
  const totalBookings = dailyStats.reduce((sum, s) => sum + s.totalBookings, 0);
  const activeUsers = dailyStats[dailyStats.length - 1]?.activeStudents || 0;

  // Calculate growth rate (last 7 days vs previous 7 days)
  const last7Days = dailyStats.slice(-7);
  const prev7Days = dailyStats.slice(-14, -7);
  const last7DaysBookings = last7Days.reduce((sum, s) => sum + s.totalBookings, 0);
  const prev7DaysBookings = prev7Days.reduce((sum, s) => sum + s.totalBookings, 0);
  const growthRate =
    prev7DaysBookings > 0
      ? ((last7DaysBookings - prev7DaysBookings) / prev7DaysBookings) * 100
      : 0;

  return {
    daily: dailyStats as unknown as PlatformDailyStats[],
    summary: {
      totalRevenue,
      totalBookings,
      activeUsers,
      growthRate: Math.round(growthRate * 10) / 10,
    },
  };
}
