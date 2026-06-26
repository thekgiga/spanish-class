import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { pricingAuth } from "../middleware/pricingAuth.js";
import {
  getStudentPricing,
  setStudentPricing,
  deleteStudentPricing,
  getProfessorStudents,
} from "../services/pricing.js";
import { AppError } from "../middleware/error.js";
import {
  createPricingSchema,
  updatePricingSchema,
  studentIdParamSchema,
} from "@spanish-class/shared";

const router = Router();

router.use(authenticate);
router.use(pricingAuth);

/**
 * GET /api/pricing/students (T053)
 */
router.get("/students", async (req, res, next) => {
  try {
    const students = await getProfessorStudents(req.user!.id);
    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pricing/students/:studentId (T056)
 */
router.get("/students/:studentId", async (req, res, next) => {
  try {
    const parsed = studentIdParamSchema.safeParse(req.params);
    if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

    const pricing = await getStudentPricing(req.user!.id, parsed.data.studentId);
    res.json({ success: true, data: pricing ?? null });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/pricing/students/:studentId (T054)
 */
router.post("/students/:studentId", validate(createPricingSchema), async (req, res, next) => {
  try {
    const parsed = studentIdParamSchema.safeParse(req.params);
    if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

    const { priceRSD, notes } = req.body;
    const pricing = await setStudentPricing(req.user!.id, parsed.data.studentId, priceRSD, notes);
    res.json({ success: true, data: pricing, message: "Pricing created successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/pricing/students/:studentId (T055)
 */
router.put("/students/:studentId", validate(updatePricingSchema), async (req, res, next) => {
  try {
    const parsed = studentIdParamSchema.safeParse(req.params);
    if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

    const { priceRSD, notes } = req.body;
    const pricing = await setStudentPricing(req.user!.id, parsed.data.studentId, priceRSD, notes);
    res.json({ success: true, data: pricing, message: "Pricing updated successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/pricing/students/:studentId
 */
router.delete("/students/:studentId", async (req, res, next) => {
  try {
    const parsed = studentIdParamSchema.safeParse(req.params);
    if (!parsed.success) throw new AppError(400, parsed.error.errors[0].message);

    await deleteStudentPricing(req.user!.id, parsed.data.studentId);
    res.json({ success: true, message: "Pricing deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
