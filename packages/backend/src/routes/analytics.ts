import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
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
router.get("/professor", async (req, res, next) => {
  try {
    const professorId = req.user!.id;

    // Parse date range from query params
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago

    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date(); // Default: today

    const analytics = await getProfessorAnalytics(professorId, startDate, endDate);

    res.json({
      success: true,
      data: analytics,
    });
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
    const { id: studentId } = req.params;
    const userId = req.user!.id;

    // Only allow users to view their own stats or admins to view any
    if (userId !== studentId && !req.user!.isAdmin) {
      throw new AppError(403, "You can only view your own statistics");
    }

    const stats = await getStudentEngagementStats(studentId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/platform (T096)
 * Get platform-wide analytics (admin only)
 */
router.get("/platform", async (req, res, next) => {
  try {
    if (!req.user!.isAdmin) {
      throw new AppError(403, "Only administrators can view platform analytics");
    }

    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    const analytics = await getPlatformAnalytics(startDate, endDate);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
