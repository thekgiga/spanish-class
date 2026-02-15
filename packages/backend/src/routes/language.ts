import { Router } from "express";
import { detectLanguage, type Locale } from "../middleware/languageDetection.js";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";

const router = Router();

/**
 * GET /api/language/detect (T065)
 * Detect user's preferred language from request headers and IP
 */
router.get("/detect", (req, res) => {
  const detection = detectLanguage(req);

  res.json({
    success: true,
    data: detection,
  });
});

/**
 * POST /api/users/language-preference (T066)
 * Update user's language preference
 */
router.post("/preference", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { locale } = req.body;

    // Validate locale
    const validLocales: Locale[] = ["en", "sr", "es"];
    if (!validLocales.includes(locale)) {
      throw new AppError(400, "Invalid locale. Must be one of: en, sr, es");
    }

    // Update user's language preference
    const user = await prisma.user.update({
      where: { id: userId },
      data: { languagePreference: locale },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        timezone: true,
        languagePreference: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user },
      message: "Language preference updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
