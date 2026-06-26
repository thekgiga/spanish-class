import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
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
