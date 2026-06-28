import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";
import { AppError } from "../middleware/error.js";
import {
  dateRangeQuerySchema,
  userIdParamSchema,
} from "@spanish-class/shared";
import {
  getProfessorAnalytics,
  getStudentEngagementStats,
  getPlatformAnalytics,
} from "../services/analytics.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.use(authenticate);

/**
 * GET /api/analytics/professor (T094)
 * Get analytics for the authenticated professor
 */
router.get("/professor", validateQuery(dateRangeQuerySchema), async (req, res, next) => {
  try {
    const professorId = req.user!.id;
    const { startDate, endDate } = req.query as any;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await getProfessorAnalytics(professorId, start, end);
    res.json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/professor/export — AN4: CSV earnings export
 * Query params: startDate, endDate (ISO strings)
 */
router.get("/professor/export", requireAdmin, validateQuery(dateRangeQuerySchema), async (req, res, next) => {
  try {
    const professorId = req.user!.id;
    const { startDate, endDate } = req.query as any;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Fetch COMPLETED bookings with student + slot info
    const bookings = await prisma.booking.findMany({
      where: {
        status: "COMPLETED",
        slot: {
          professorId,
          endTime: { gte: start, lte: end },
        },
      },
      include: {
        slot: { select: { title: true, startTime: true, endTime: true, professorId: true } },
        student: { select: { firstName: true, lastName: true, id: true } },
      },
      orderBy: { slot: { startTime: "asc" } },
    });

    // Batch fetch pricing
    const studentIds = [...new Set(bookings.map((b) => b.studentId))];
    const pricings = studentIds.length > 0
      ? await prisma.studentPricing.findMany({
          where: { professorId, studentId: { in: studentIds } },
          select: { studentId: true, priceRSD: true },
        })
      : [];
    const priceMap = new Map(pricings.map((p) => [p.studentId, p.priceRSD]));

    // Build CSV
    const lines: string[] = [
      "Date,Student Name,Class Title,Duration (min),Price (RSD)",
    ];

    for (const b of bookings) {
      const date = new Date(b.slot.startTime).toISOString().split("T")[0];
      const studentName = `${b.student.firstName} ${b.student.lastName}`;
      const title = (b.slot.title || "Spanish Class").replace(/,/g, " ");
      const duration = Math.round(
        (new Date(b.slot.endTime).getTime() - new Date(b.slot.startTime).getTime()) / 60000,
      );
      const price = priceMap.get(b.studentId) ?? 0;
      lines.push(`${date},"${studentName}","${title}",${duration},${price}`);
    }

    const csv = lines.join("\n");
    const filename = `earnings-${new Date().toISOString().split("T")[0]}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/student/:id (T095)
 * Get engagement stats for a student
 */
router.get("/student/:id", async (req, res, next) => {
  try {
    const parsed = userIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors[0].message);
    }
    const { id: studentId } = parsed.data;
    const userId = req.user!.id;

    if (userId !== studentId && !req.user!.isAdmin) {
      throw new AppError(403, "You can only view your own statistics");
    }

    const stats = await getStudentEngagementStats(studentId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/platform (T096)
 * Get platform-wide analytics (admin only)
 */
router.get("/platform", validateQuery(dateRangeQuerySchema), async (req, res, next) => {
  try {
    if (!req.user!.isAdmin) {
      throw new AppError(403, "Only administrators can view platform analytics");
    }
    const { startDate, endDate } = req.query as any;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await getPlatformAnalytics(start, end);
    res.json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
});

export default router;
