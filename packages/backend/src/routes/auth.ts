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
} from "@spanish-class/shared";
import { AppError } from "../middleware/error.js";
import { sendVerificationEmail } from "../services/email.js";
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

// POST /api/auth/register
router.post("/register", authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, timezone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, "An account with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiresAt = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    // Create user (always as student, admin created via seed)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        timezone: timezone || "Europe/Madrid",
        isAdmin: false,
        // Email verification not implemented yet
        // isEmailVerified: false,
        // emailVerificationToken: verificationToken,
        // emailVerificationExpiresAt: verificationExpiresAt,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        timezone: true,
        // isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      verificationToken,
    }).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError(401, "Invalid email or password");
    }

    // Email verification not implemented yet
    // Check if email is verified
    // if (!user.isEmailVerified) {
    //   throw new AppError(
    //     403,
    //     "Please verify your email before logging in. Check your inbox for the verification link.",
    //   );
    // }

    // Prepare user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      timezone: user.timezone,
      // isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Generate token
    const token = generateToken(userData);

    // Check if admin needs to complete 2FA verification
    const totpRequired = user.isAdmin && (await isTotpRequired(user.id));
    if (totpRequired) {
      // Issue a short-lived pre-auth token that only unlocks the 2FA verify endpoint.
      // The client must hit POST /api/auth/2fa/verify to get the real token.
      const preAuthToken = generateToken({ ...userData, twoFactorPending: true } as any);
      res.cookie("token", preAuthToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000, // 5 minutes only
      });
      res.json({
        success: true,
        data: { totpRequired: true },
      });
      return;
    }

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// POST /api/auth/verify-email
router.post("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      throw new AppError(400, "Verification token is required");
    }

    // Email verification not implemented yet - fields don't exist in schema
    throw new AppError(501, "Email verification is not yet implemented");

    // Find user by verification token
    // const user = await prisma.user.findUnique({
    //   where: { emailVerificationToken: token },
    // });

    // if (!user) {
    //   throw new AppError(400, "Invalid or expired verification link");
    // }

    // // Check if token has expired
    // if (
    //   user.emailVerificationExpiresAt &&
    //   user.emailVerificationExpiresAt < new Date()
    // ) {
    //   throw new AppError(
    //     400,
    //     "Verification link has expired. Please request a new one.",
    //   );
    // }

    // // Check if already verified
    // if (user.isEmailVerified) {
    //   return res.json({
    //     success: true,
    //     message: "Email is already verified. You can now log in.",
    //   });
    // }

    // // Update user to verified
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     isEmailVerified: true,
    //     emailVerificationToken: null,
    //     emailVerificationExpiresAt: null,
    //   },
    // });

    // res.json({
    //   success: true,
    //   message: "Email verified successfully. You can now log in.",
    // });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/resend-verification
router.post("/resend-verification", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      throw new AppError(400, "Email is required");
    }

    // Email verification not implemented yet - fields don't exist in schema
    res.json({
      success: true,
      message: "Email verification is not yet implemented.",
    });

    // Find user by email
    // const user = await prisma.user.findUnique({
    //   where: { email },
    // });

    // // Don't reveal if email exists or not for security
    // if (!user) {
    //   return res.json({
    //     success: true,
    //     message:
    //       "If an account with this email exists and is unverified, a new verification email has been sent.",
    //   });
    // }

    // // Check if already verified
    // if (user.isEmailVerified) {
    //   return res.json({
    //     success: true,
    //     message:
    //       "If an account with this email exists and is unverified, a new verification email has been sent.",
    //   });
    // }

    // // Generate new verification token
    // const verificationToken = crypto.randomBytes(32).toString("hex");
    // const verificationExpiresAt = new Date(
    //   Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    // );

    // // Update user with new token
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     emailVerificationToken: verificationToken,
    //     emailVerificationExpiresAt: verificationExpiresAt,
    //   },
    // });

    // // Send verification email (non-blocking)
    // sendVerificationEmail({
    //   email: user.email,
    //   firstName: user.firstName,
    //   verificationToken,
    // }).catch((err) => {
    //   console.error("Failed to send verification email:", err);
    // });

    // res.json({
    //   success: true,
    //   message:
    //     "If an account with this email exists and is unverified, a new verification email has been sent.",
    // });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile
router.put(
  "/profile",
  authenticate,
  validate(updateUserSchema),
  async (req, res, next) => {
    try {
      const { firstName, lastName, timezone } = req.body;
      const userId = req.user!.id;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(timezone !== undefined && { timezone }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isAdmin: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ── 2FA endpoints (admin only) ────────────────────────────────────────────────

// GET /api/auth/2fa/setup — generate a TOTP secret + QR code + recovery codes
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

// POST /api/auth/2fa/verify — verify code and enable 2FA (first time) OR
//   complete a login when totpRequired was true in the login response.
router.post("/2fa/verify", validate(verifyTotpSchema), authenticate, async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user!.id;
    const tf = await prisma.userTwoFactor.findUnique({ where: { userId } });

    if (!tf?.enabled) {
      // Enrollment flow
      const ok = await verifyAndEnableTotp(userId, code);
      if (!ok) throw new AppError(400, "Invalid TOTP code");
      res.json({ success: true, message: "2FA enabled successfully" });
      return;
    }

    // Login-completion flow
    const ok = await verifyTotpCode(userId, code);
    if (!ok) throw new AppError(401, "Invalid TOTP code");

    const userData = {
      id: req.user!.id,
      email: req.user!.email,
      firstName: req.user!.firstName,
      lastName: req.user!.lastName,
      isAdmin: req.user!.isAdmin,
      timezone: req.user!.timezone,
      createdAt: req.user!.createdAt,
      updatedAt: req.user!.updatedAt,
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

// POST /api/auth/2fa/recovery — verify a recovery code to bypass TOTP
router.post(
  "/2fa/recovery",
  validate(verifyTotpWithRecoverySchema),
  authenticate,
  async (req, res, next) => {
    try {
      const ok = await verifyRecoveryCode(req.user!.id, req.body.code);
      if (!ok) throw new AppError(401, "Invalid recovery code");
      const userData = {
        id: req.user!.id,
        email: req.user!.email,
        firstName: req.user!.firstName,
        lastName: req.user!.lastName,
        isAdmin: req.user!.isAdmin,
        timezone: req.user!.timezone,
        createdAt: req.user!.createdAt,
        updatedAt: req.user!.updatedAt,
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

// POST /api/auth/2fa/disable — admin self-service or emergency reset
router.post("/2fa/disable", authenticate, requireAdmin, async (req, res, next) => {
  try {
    await disableTotp(req.user!.id);
    res.json({ success: true, message: "2FA disabled" });
  } catch (err) {
    next(err);
  }
});

export default router;

