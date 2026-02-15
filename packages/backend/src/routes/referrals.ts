import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getUserReferralCode,
  trackReferral,
  getReferralStats,
} from "../services/referrals.js";

const router = Router();

router.use(authenticate);

/**
 * GET /api/referrals/my-code (T107)
 */
router.get("/my-code", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const code = await getUserReferralCode(userId);

    res.json({
      success: true,
      data: { referralCode: code },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/referrals/track (T108)
 */
router.post("/track", async (req, res, next) => {
  try {
    const { referralCode } = req.body;
    const referredId = req.user!.id;

    const referral = await trackReferral(referralCode, referredId);

    res.json({
      success: true,
      data: referral,
      message: "Referral tracked successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/referrals/stats (T109)
 */
router.get("/stats", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const stats = await getReferralStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
