import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AppError } from "../middleware/error.js";
import { createRatingSchema, userIdParamSchema } from "@spanish-class/shared";
import {
  createRating,
  getUserRatings,
  getPendingRatings,
} from "../services/ratings.js";

const router = Router();

router.use(authenticate);

/**
 * POST /api/ratings (T113)
 */
router.post("/", validate(createRatingSchema), async (req, res, next) => {
  try {
    const raterId = req.user!.id;
    const { rateeId, rating, comment, bookingId, isAnonymous } = req.body;

    const newRating = await createRating(raterId, rateeId, rating, comment, bookingId, isAnonymous);
    res.json({ success: true, data: newRating, message: "Rating submitted successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ratings/user/:id (T114)
 */
router.get("/user/:id", async (req, res, next) => {
  try {
    const parsed = userIdParamSchema.safeParse(req.params);
    if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

    const ratings = await getUserRatings(parsed.data.id);
    res.json({ success: true, data: ratings });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ratings/pending (T115)
 */
router.get("/pending", async (req, res, next) => {
  try {
    const pending = await getPendingRatings(req.user!.id);
    res.json({ success: true, data: pending });
  } catch (error) {
    next(error);
  }
});

export default router;
