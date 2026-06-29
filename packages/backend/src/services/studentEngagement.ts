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
