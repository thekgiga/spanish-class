import { Router } from "express";
import { authenticate, requireAdmin, requireStudent } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { submitFeedbackSchema, paginationSchema } from "@spanish-class/shared";
import {
  submitFeedback,
  getProfessorFeedback,
  getAdminFeedbackSummary,
  getBookingFeedback,
} from "../services/sessionFeedback.js";
import { AppError } from "../middleware/error.js";

const router = Router();

router.use(authenticate);

/**
 * POST /api/feedback — student submits session feedback
 */
router.post("/", requireStudent, validate(submitFeedbackSchema), async (req, res, next) => {
  try {
    const { bookingId, rating, whatWasGood, whatCouldBeImproved } = req.body;
    const feedback = await submitFeedback(
      bookingId,
      req.user!.id,
      rating,
      whatWasGood,
      whatCouldBeImproved,
    );
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feedback/professor — professor views their own feedback
 * Optional ?studentId= to filter by specific student
 */
router.get("/professor", requireAdmin, validateQuery(paginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const { studentId } = req.query as { studentId?: string };
    const result = await getProfessorFeedback(req.user!.id, page, limit, studentId);
    res.json({
      success: true,
      data: result,
      pagination: { page, limit, total: result.total, totalPages: result.totalPages },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feedback/professor/:professorId — admin views specific professor's feedback
 */
router.get("/professor/:professorId", requireAdmin, validateQuery(paginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const { studentId } = req.query as { studentId?: string };
    const result = await getProfessorFeedback(req.params.professorId, page, limit, studentId);
    res.json({
      success: true,
      data: result,
      pagination: { page, limit, total: result.total, totalPages: result.totalPages },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feedback/admin/summary — admin sees all professors' feedback summary
 */
router.get("/admin/summary", requireAdmin, async (req, res, next) => {
  try {
    const summary = await getAdminFeedbackSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feedback/booking/:bookingId — check if feedback already submitted
 */
router.get("/booking/:bookingId", async (req, res, next) => {
  try {
    const feedback = await getBookingFeedback(req.params.bookingId);
    res.json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
});

export default router;
