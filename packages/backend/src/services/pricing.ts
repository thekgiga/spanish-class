import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";
import type { StudentPricing, UserPublic } from "@spanish-class/shared";

/**
 * Get all student pricing for a professor
 */
export async function getProfessorPricing(
  professorId: string,
): Promise<StudentPricing[]> {
  const pricing = await prisma.studentPricing.findMany({
    where: { professorId },
    orderBy: { createdAt: "desc" },
  });

  return pricing as unknown as StudentPricing[];
}

/**
 * Get pricing for a specific student
 */
export async function getStudentPricing(
  professorId: string,
  studentId: string,
): Promise<StudentPricing | null> {
  const pricing = await prisma.studentPricing.findUnique({
    where: {
      professorId_studentId: {
        professorId,
        studentId,
      },
    },
  });

  return pricing as unknown as StudentPricing | null;
}

/**
 * Create or update pricing for a student
 */
export async function setStudentPricing(
  professorId: string,
  studentId: string,
  priceRSD: number,
  notes?: string,
): Promise<StudentPricing> {
  // Validate price
  if (priceRSD < 0 || priceRSD > 100000) {
    throw new AppError(400, "Price must be between 0 and 100,000 RSD");
  }

  // Verify student exists
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new AppError(404, "Student not found");
  }

  // Create or update pricing
  const pricing = await prisma.studentPricing.upsert({
    where: {
      professorId_studentId: {
        professorId,
        studentId,
      },
    },
    create: {
      professorId,
      studentId,
      priceRSD,
      notes,
    },
    update: {
      priceRSD,
      notes,
    },
  });

  return pricing as unknown as StudentPricing;
}

/**
 * Delete pricing for a student
 */
export async function deleteStudentPricing(
  professorId: string,
  studentId: string,
): Promise<void> {
  await prisma.studentPricing.delete({
    where: {
      professorId_studentId: {
        professorId,
        studentId,
      },
    },
  });
}

/**
 * Get all students who have booked with this professor (for pricing management)
 */
export async function getProfessorStudents(
  professorId: string,
): Promise<Array<UserPublic & { pricing?: StudentPricing | null }>> {
  // Get all unique students who have booked with this professor
  const bookings = await prisma.booking.findMany({
    where: {
      slot: {
        professorId,
      },
    },
    distinct: ["studentId"],
    include: {
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

  const studentIds = bookings.map((b) => b.studentId);

  // Get pricing for all these students
  const pricings = await prisma.studentPricing.findMany({
    where: {
      professorId,
      studentId: { in: studentIds },
    },
  });

  // Map pricing to students
  const pricingMap = new Map(
    pricings.map((p) => [p.studentId, p as unknown as StudentPricing]),
  );

  return bookings.map((b) => ({
    ...b.student,
    pricing: pricingMap.get(b.studentId) || null,
  }));
}
