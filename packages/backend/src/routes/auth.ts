import { Router, type Router as RouterType } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { generateToken } from "../lib/jwt.js";
import { validate } from "../middleware/validate.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  loginSchema,
  registerSchema,
  updateUserSchema,
  verifyTotpSchema,
  verifyTotpWithRecoverySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "@spanish-class/shared";
import { AppError } from "../middleware/error.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email.js";
import {
  createPasswordResetToken,
  validateAndConsumePasswordResetToken,
} from "../services/passwordReset.js";
import {
  generateTotpSetup,
  verifyAndEnableTotp,
  verifyTotpCode,
  verifyRecoveryCode,
  isTotpRequired,
  disableTotp,
} from "../services/twoFactor.js";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

const router: RouterType = Router();

// ── Register ──────────────────────────────────────────────────────────────────

router.post("/register", authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, timezone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiresAt = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        timezone: timezone || "Europe/Madrid",
        isAdmin: false,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        timezone: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Non-blocking — don't fail registration if email fails
    sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      verificationToken,
    }).catch((err) => {
      console.error("[auth] Failed to send verification email:", err);
    });

    res.status(201).json({
      success: true,
      message: "Account created! Please check your email to verify your account.",
      data: {
        user,
        requiresEmailVerification: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────

router.post("/login", authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, "Invalid email or password");

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) throw new AppError(401, "Invalid email or password");

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      timezone: user.timezone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Admin 2FA gate
    const totpRequired = user.isAdmin && (await isTotpRequired(user.id));
    if (totpRequired) {
      const preAuthToken = generateToken({ ...userData, twoFactorPending: true } as any);
      res.cookie("token", preAuthToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
      });
      res.json({ success: true, data: { totpRequired: true } });
      return;
    }

    const token = generateToken(userData);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        user: userData,
        token,
        // Soft flag — frontend shows a dismissible banner when false
        emailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Me + Logout + Profile ─────────────────────────────────────────────────────

router.get("/me", authenticate, async (req, res) => {
  // Enrich with twoFactorEnabled so the frontend can show the 2FA setup prompt
  const tf = await prisma.userTwoFactor.findUnique({
    where: { userId: req.user!.id },
    select: { enabled: true },
  });
  res.json({
    success: true,
    data: { user: { ...req.user, twoFactorEnabled: tf?.enabled ?? false } },
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ success: true, message: "Logged out successfully" });
});

router.put(
  "/profile",
  authenticate,
  validate(updateUserSchema),
  async (req, res, next) => {
    try {
      const { firstName, lastName, timezone } = req.body;
      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(timezone !== undefined && { timezone }),
        },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          isAdmin: true, timezone: true, createdAt: true, updatedAt: true,
        },
      });
      res.json({ success: true, data: { user: updatedUser } });
    } catch (error) {
      next(error);
    }
  },
);

// ── Email verification ────────────────────────────────────────────────────────

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  async (req, res, next) => {
    try {
      const { token } = req.body;

      const user = await prisma.user.findUnique({
        where: { emailVerificationToken: token },
      });

      if (!user) {
        throw new AppError(400, "Invalid or expired verification link.");
      }

      if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt < new Date()) {
        throw new AppError(400, "Verification link has expired. Please request a new one.");
      }

      if (user.isEmailVerified) {
        const userData = {
          id: user.id, email: user.email, firstName: user.firstName,
          lastName: user.lastName, isAdmin: user.isAdmin, timezone: user.timezone,
          createdAt: user.createdAt, updatedAt: user.updatedAt,
        };
        const authToken = generateToken(userData);
        res.cookie("token", authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
          success: true,
          message: "Email already verified.",
          data: { user: userData, token: authToken, emailVerified: true },
        });
        return;
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiresAt: null,
        },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          isAdmin: true, timezone: true, createdAt: true, updatedAt: true,
        },
      });

      const authToken = generateToken(updated);
      res.cookie("token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Email verified successfully!",
        data: { user: updated, token: authToken, emailVerified: true },
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/resend-verification",
  authLimiter,
  validate(resendVerificationSchema),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const SAFE_RESPONSE = {
        success: true,
        message: "If an account with this email exists and is unverified, a new verification email has been sent.",
      };

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.isEmailVerified) {
        res.json(SAFE_RESPONSE);
        return;
      }

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpiresAt = new Date(
        Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationExpiresAt: verificationExpiresAt,
        },
      });

      sendVerificationEmail({
        email: user.email,
        firstName: user.firstName,
        verificationToken,
      }).catch((err) => {
        console.error("[auth] Failed to resend verification email:", err);
      });

      res.json(SAFE_RESPONSE);
    } catch (error) {
      next(error);
    }
  },
);

// ── Password reset ────────────────────────────────────────────────────────────

router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const SAFE_RESPONSE = {
        success: true,
        message: "If an account exists for this email, a reset link has been sent.",
      };

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.json(SAFE_RESPONSE);
        return;
      }

      const resetToken = await createPasswordResetToken(user.id);

      sendPasswordResetEmail({
        email: user.email,
        firstName: user.firstName,
        resetToken,
      }).catch((err) => {
        console.error("[auth] Failed to send password reset email:", err);
      });

      res.json(SAFE_RESPONSE);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  async (req, res, next) => {
    try {
      const { token, password } = req.body;

      const userId = await validateAndConsumePasswordResetToken(token);

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          isAdmin: true, timezone: true, createdAt: true, updatedAt: true,
        },
      });

      const authToken = generateToken(user);
      res.cookie("token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Password reset successfully.",
        data: { user, token: authToken, emailVerified: true },
      });
    } catch (error) {
      // Wrap service errors as 400s
      if (error instanceof Error && !(error instanceof AppError)) {
        return next(new AppError(400, error.message));
      }
      next(error);
    }
  },
);

// ── 2FA (admin only) ──────────────────────────────────────────────────────────

router.get("/2fa/setup", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { qrCodeDataUrl, recoveryCodes } = await generateTotpSetup(
      req.user!.id,
      req.user!.email,
    );
    res.json({ success: true, data: { qrCodeDataUrl, recoveryCodes } });
  } catch (err) {
    next(err);
  }
});

router.post("/2fa/verify", validate(verifyTotpSchema), authenticate, async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user!.id;
    const tf = await prisma.userTwoFactor.findUnique({ where: { userId } });

    if (!tf?.enabled) {
      const ok = await verifyAndEnableTotp(userId, code);
      if (!ok) throw new AppError(400, "Invalid TOTP code");
      res.json({ success: true, message: "2FA enabled successfully" });
      return;
    }

    const ok = await verifyTotpCode(userId, code);
    if (!ok) throw new AppError(401, "Invalid TOTP code");

    const userData = {
      id: req.user!.id, email: req.user!.email, firstName: req.user!.firstName,
      lastName: req.user!.lastName, isAdmin: req.user!.isAdmin, timezone: req.user!.timezone,
      createdAt: req.user!.createdAt, updatedAt: req.user!.updatedAt,
    };
    const token = generateToken(userData);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, data: { user: userData, token } });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/2fa/recovery",
  validate(verifyTotpWithRecoverySchema),
  authenticate,
  async (req, res, next) => {
    try {
      const ok = await verifyRecoveryCode(req.user!.id, req.body.code);
      if (!ok) throw new AppError(401, "Invalid recovery code");
      const userData = {
        id: req.user!.id, email: req.user!.email, firstName: req.user!.firstName,
        lastName: req.user!.lastName, isAdmin: req.user!.isAdmin, timezone: req.user!.timezone,
        createdAt: req.user!.createdAt, updatedAt: req.user!.updatedAt,
      };
      const token = generateToken(userData);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ success: true, data: { user: userData, token } });
    } catch (err) {
      next(err);
    }
  },
);

router.post("/2fa/disable", authenticate, requireAdmin, async (req, res, next) => {
  try {
    await disableTotp(req.user!.id);
    res.json({ success: true, message: "2FA disabled" });
  } catch (err) {
    next(err);
  }
});

export default router;
