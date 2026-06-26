import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { trackReferralSchema } from "@spanish-class/shared";
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
    const code = await getUserReferralCode(req.user!.id);
    res.json({ success: true, data: { referralCode: code } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/referrals/track (T108)
 */
router.post("/track", validate(trackReferralSchema), async (req, res, next) => {
  try {
    const { referralCode } = req.body;
    const referral = await trackReferral(referralCode, req.user!.id);
    res.json({ success: true, data: referral, message: "Referral tracked successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/referrals/stats (T109)
 */
router.get("/stats", async (req, res, next) => {
  try {
    const stats = await getReferralStats(req.user!.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;
