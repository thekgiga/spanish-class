import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { pricingAuth } from "../middleware/pricingAuth.js";
import {
  getProfessorPricing,
  getStudentPricing,
  setStudentPricing,
  deleteStudentPricing,
  getProfessorStudents,
} from "../services/pricing.js";
import { AppError } from "../middleware/error.js";

const router = Router();

// All pricing routes require authentication and professor role
router.use(authenticate);
router.use(pricingAuth);

/**
 * GET /api/pricing/students (T053)
 * Get all students with their pricing for the authenticated professor
 */
router.get("/students", async (req, res, next) => {
  try {
    const professorId = req.user!.id;
    const students = await getProfessorStudents(professorId);

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pricing/students/:studentId (T056)
 * Get pricing for a specific student
 */
router.get("/students/:studentId", async (req, res, next) => {
  try {
    const professorId = req.user!.id;
    const { studentId } = req.params;

    const pricing = await getStudentPricing(professorId, studentId);

    if (!pricing) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/pricing/students/:studentId (T054)
 * Create pricing for a student
 */
router.post("/students/:studentId", async (req, res, next) => {
  try {
    const professorId = req.user!.id;
    const { studentId } = req.params;
    const { priceRSD, notes } = req.body;

    if (typeof priceRSD !== "number") {
      throw new AppError(400, "Price must be a number");
    }

    const pricing = await setStudentPricing(
      professorId,
      studentId,
      priceRSD,
      notes,
    );

    res.json({
      success: true,
      data: pricing,
      message: "Pricing created successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/pricing/students/:studentId (T055)
 * Update pricing for a student
 */
router.put("/students/:studentId", async (req, res, next) => {
  try {
    const professorId = req.user!.id;
    const { studentId } = req.params;
    const { priceRSD, notes } = req.body;

    if (typeof priceRSD !== "number") {
      throw new AppError(400, "Price must be a number");
    }

    const pricing = await setStudentPricing(
      professorId,
      studentId,
      priceRSD,
      notes,
    );

    res.json({
      success: true,
      data: pricing,
      message: "Pricing updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/pricing/students/:studentId
 * Delete pricing for a student
 */
router.delete("/students/:studentId", async (req, res, next) => {
  try {
    const professorId = req.user!.id;
    const { studentId } = req.params;

    await deleteStudentPricing(professorId, studentId);

    res.json({
      success: true,
      message: "Pricing deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
