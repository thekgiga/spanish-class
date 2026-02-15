import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
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
router.post("/", async (req, res, next) => {
  try {
    const raterId = req.user!.id;
    const { rateeId, rating, comment, bookingId, isAnonymous } = req.body;

    const newRating = await createRating(
      raterId,
      rateeId,
      rating,
      comment,
      bookingId,
      isAnonymous,
    );

    res.json({
      success: true,
      data: newRating,
      message: "Rating submitted successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ratings/user/:id (T114)
 */
router.get("/user/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const ratings = await getUserRatings(id);

    res.json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ratings/pending (T115)
 */
router.get("/pending", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const pending = await getPendingRatings(userId);

    res.json({
      success: true,
      data: pending,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
