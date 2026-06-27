import { Router, type Router as RouterType } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { generateToken } from "../lib/jwt.js";
import { validate } from "../middleware/validate.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { authLimiter, twoFactorLimiter } from "../middleware/rateLimiter.js";
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
  changePasswordSchema,
  changeEmailSchema,
  deleteAccountSchema,
  regenRecoveryCodesSchema,
} from "@spanish-class/shared";
import { AppError } from "../middleware/error.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
  sendEmailChangeVerificationEmail,
  sendEmailChangedNotificationEmail,
  sendAccountDeletionEmail,
  sendNewIpAlertEmail,
} from "../services/email.js";
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
  regenerateRecoveryCodes,
} from "../services/twoFactor.js";
import { trackReferral } from "../services/referrals.js";
import {
  acceptStudentInvitation,
  getInvitationByToken,
} from "../services/studentInvitation.js";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const EMAIL_CHANGE_TOKEN_EXPIRY_HOURS = 24;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const router: RouterType = Router();

// ── Accept Invitation (public redirect — no auth required) ────────────────────

router.get("/accept-invitation", async (req, res, next) => {
  try {
    const { token } = req.query as { token?: string };
    if (!token) {
      res.redirect(`${FRONTEND_URL}/auth?invitation_expired=1`);
      return;
    }

    let invitation: Awaited<ReturnType<typeof getInvitationByToken>>;
    try {
      invitation = await getInvitationByToken(token);
    } catch {
      res.redirect(`${FRONTEND_URL}/auth?invitation_expired=1`);
      return;
    }

    if (invitation.expired) {
      res.redirect(`${FRONTEND_URL}/auth?invitation_expired=1`);
      return;
    }
    if (invitation.accepted) {
      res.redirect(`${FRONTEND_URL}/auth?invitation_already_accepted=1`);
      return;
    }

    // Check if this email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true, deletedAt: true },
    });

    if (existingUser && !existingUser.deletedAt) {
      // Already registered — auto-accept and send to dashboard
      await acceptStudentInvitation(token, existingUser.id);
      res.redirect(`${FRONTEND_URL}/dashboard?professor_assigned=1`);
      return;
    }

    // Not registered — redirect to register with pre-filled email + invite token
    const params = new URLSearchParams({ email: invitation.email, invite: token });
    res.redirect(`${FRONTEND_URL}/auth?tab=register&${params.toString()}`);
  } catch (error) {
    next(error);
  }
});

// ── Register ──────────────────────────────────────────────────────────────────

router.post("/register", authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, timezone, referralCode, inviteToken } = req.body;

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

    // RF4: Track referral non-blocking
    if (referralCode) {
      trackReferral(referralCode, user.id).catch((err) => {
        console.error("[auth] Referral tracking failed:", err);
      });
    }

    // Professor–student: Accept invitation non-blocking
    if (inviteToken) {
      acceptStudentInvitation(inviteToken, user.id).catch((err) => {
        console.error("[auth] Invitation acceptance failed:", err);
      });
    }

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

    // Reject soft-deleted accounts with a generic message (no information leakage)
    if (user.deletedAt) throw new AppError(401, "Invalid email or password");

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

    // A7: Track new IPs for admin accounts and send alert email
    if (user.isAdmin) {
      const ip =
        ((req.headers["x-forwarded-for"] as string) || "")
          .split(",")[0]
          .trim() || req.socket.remoteAddress || "unknown";
      const knownIps: string[] = user.knownIps ? JSON.parse(user.knownIps) : [];
      if (!knownIps.includes(ip)) {
        sendNewIpAlertEmail({
          email: user.email,
          firstName: user.firstName,
          ip,
          timestamp: new Date(),
        }).catch((err) => console.error("[auth] IP alert email failed:", err));
        await prisma.user.update({
          where: { id: user.id },
          data: { knownIps: JSON.stringify([...knownIps, ip].slice(-10)) },
        });
      }
    }

    // Admin 2FA gate
    const totpRequired = user.isAdmin && (await isTotpRequired(user.id));
    if (totpRequired) {
      const preAuthToken = generateToken(userData, { twoFactorPending: true });
      res.cookie("token", preAuthToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
      });
      res.json({ success: true, data: { totpRequired: true } });
      return;
    }

    const token = generateToken(userData, { tokenVersion: user.tokenVersion });
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
        emailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Me + Logout + Logout-all + Profile ────────────────────────────────────────

router.get("/me", authenticate, async (req, res) => {
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

// A3: Sign out all sessions by incrementing tokenVersion
router.post("/logout-all", authenticate, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { tokenVersion: { increment: 1 } },
    });
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.json({ success: true, message: "All sessions have been terminated" });
  } catch (error) {
    next(error);
  }
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
        const authToken = generateToken(userData, { tokenVersion: user.tokenVersion });
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
          tokenVersion: true,
        },
      });

      // A11: Welcome email after first verification
      sendWelcomeEmail({ email: updated.email, firstName: updated.firstName }).catch((err) => {
        console.error("[auth] Failed to send welcome email:", err);
      });

      const { tokenVersion: _tv, ...updatedPublic } = updated;
      const authToken = generateToken(updatedPublic, { tokenVersion: updated.tokenVersion });
      res.cookie("token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Email verified successfully!",
        data: { user: updatedPublic, token: authToken, emailVerified: true },
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

      // A1+A2: increment tokenVersion to invalidate all existing sessions, update password
      const user = await prisma.user.update({
        where: { id: userId },
        data: { passwordHash, tokenVersion: { increment: 1 } },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          isAdmin: true, timezone: true, createdAt: true, updatedAt: true,
          tokenVersion: true,
        },
      });

      // A1: Notify user that password was changed
      sendPasswordChangedEmail({ email: user.email, firstName: user.firstName }).catch((err) => {
        console.error("[auth] Failed to send password-changed email:", err);
      });

      // If this is an admin with 2FA enabled, issue a pre-auth token and require 2FA step
      const totpRequired = user.isAdmin && (await isTotpRequired(user.id));
      if (totpRequired) {
        const { tokenVersion: _tv, ...userPublic } = user;
        const preAuthToken = generateToken(userPublic, { twoFactorPending: true });
        res.cookie("token", preAuthToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 5 * 60 * 1000,
        });
        res.json({ success: true, data: { totpRequired: true, user: userPublic, emailVerified: true } });
        return;
      }

      const { tokenVersion: _tv, ...userPublic } = user;
      const authToken = generateToken(userPublic, { tokenVersion: user.tokenVersion });
      res.cookie("token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Password reset successfully.",
        data: { user: userPublic, token: authToken, emailVerified: true },
      });
    } catch (error) {
      if (error instanceof Error && !(error instanceof AppError)) {
        return next(new AppError(400, error.message));
      }
      next(error);
    }
  },
);

// A2: Change password (authenticated — invalidates all sessions including current)
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, email: true, firstName: true, passwordHash: true, tokenVersion: true },
      });
      if (!user) throw new AppError(404, "User not found");

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) throw new AppError(401, "Current password is incorrect");

      const passwordHash = await bcrypt.hash(newPassword, 12);

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, tokenVersion: { increment: 1 } },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          isAdmin: true, timezone: true, createdAt: true, updatedAt: true,
          tokenVersion: true,
        },
      });

      sendPasswordChangedEmail({ email: updated.email, firstName: updated.firstName }).catch((err) => {
        console.error("[auth] Failed to send password-changed email:", err);
      });

      // Clear the current session — user must log in again with the new password
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.json({ success: true, message: "Password changed successfully. Please log in again." });
    } catch (error) {
      next(error);
    }
  },
);

// ── Email change ──────────────────────────────────────────────────────────────

// A9: Initiate email address change
router.post(
  "/change-email",
  authLimiter,
  authenticate,
  validate(changeEmailSchema),
  async (req, res, next) => {
    try {
      const { newEmail, currentPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, email: true, firstName: true, passwordHash: true },
      });
      if (!user) throw new AppError(404, "User not found");

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) throw new AppError(401, "Password is incorrect");

      const taken = await prisma.user.findUnique({ where: { email: newEmail } });
      if (taken) throw new AppError(409, "This email address is already in use");

      // Invalidate any pending email change requests
      await prisma.emailChangeRequest.deleteMany({ where: { userId: user.id } });

      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + EMAIL_CHANGE_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      await prisma.emailChangeRequest.create({
        data: { userId: user.id, newEmail, tokenHash, expiresAt },
      });

      sendEmailChangeVerificationEmail({
        newEmail,
        firstName: user.firstName,
        token: rawToken,
      }).catch((err) => console.error("[auth] Failed to send email change verification:", err));

      res.json({
        success: true,
        message: "A verification link has been sent to your new email address.",
      });
    } catch (error) {
      next(error);
    }
  },
);

// A9: Verify new email address via token link
router.get("/verify-email-change", async (req, res, next) => {
  try {
    const { token } = req.query as { token?: string };
    if (!token) throw new AppError(400, "Verification token is required");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const request = await prisma.emailChangeRequest.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true, firstName: true } } },
    });

    if (!request) throw new AppError(400, "Invalid or expired verification link");
    if (request.expiresAt < new Date()) throw new AppError(400, "Verification link has expired");

    // Race-condition guard: check new email still not taken
    const taken = await prisma.user.findUnique({ where: { email: request.newEmail } });
    if (taken) throw new AppError(409, "This email address is no longer available");

    const oldEmail = request.user.email;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: request.userId },
        data: { email: request.newEmail, tokenVersion: { increment: 1 } },
      }),
      prisma.emailChangeRequest.delete({ where: { id: request.id } }),
    ]);

    sendEmailChangedNotificationEmail({
      oldEmail,
      firstName: request.user.firstName,
      newEmail: request.newEmail,
    }).catch((err) => console.error("[auth] Failed to send email changed notification:", err));

    // Force re-login with new email
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({
      success: true,
      message: "Email address updated successfully. Please log in with your new email.",
    });
  } catch (error) {
    next(error);
  }
});

// ── Account deletion ──────────────────────────────────────────────────────────

// A10: Soft-delete account
router.post(
  "/delete-account",
  authenticate,
  validate(deleteAccountSchema),
  async (req, res, next) => {
    try {
      const { password } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, email: true, firstName: true, passwordHash: true },
      });
      if (!user) throw new AppError(404, "User not found");

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) throw new AppError(401, "Password is incorrect");

      await prisma.user.update({
        where: { id: user.id },
        data: { deletedAt: new Date(), tokenVersion: { increment: 1 } },
      });

      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      sendAccountDeletionEmail({ email: user.email, firstName: user.firstName }).catch((err) => {
        console.error("[auth] Failed to send account deletion email:", err);
      });

      res.json({ success: true, message: "Your account has been deleted." });
    } catch (error) {
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

router.post("/2fa/verify", twoFactorLimiter, validate(verifyTotpSchema), authenticate, async (req, res, next) => {
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

    // Fetch tokenVersion for the full auth token
    const userWithVersion = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenVersion: true },
    });

    const userData = {
      id: req.user!.id, email: req.user!.email, firstName: req.user!.firstName,
      lastName: req.user!.lastName, isAdmin: req.user!.isAdmin, timezone: req.user!.timezone,
      createdAt: req.user!.createdAt, updatedAt: req.user!.updatedAt,
    };
    const token = generateToken(userData, { tokenVersion: userWithVersion?.tokenVersion ?? 0 });
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
  twoFactorLimiter,
  validate(verifyTotpWithRecoverySchema),
  authenticate,
  async (req, res, next) => {
    try {
      const ok = await verifyRecoveryCode(req.user!.id, req.body.code);
      if (!ok) throw new AppError(401, "Invalid recovery code");

      const userWithVersion = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { tokenVersion: true },
      });

      const userData = {
        id: req.user!.id, email: req.user!.email, firstName: req.user!.firstName,
        lastName: req.user!.lastName, isAdmin: req.user!.isAdmin, timezone: req.user!.timezone,
        createdAt: req.user!.createdAt, updatedAt: req.user!.updatedAt,
      };
      const token = generateToken(userData, { tokenVersion: userWithVersion?.tokenVersion ?? 0 });
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

// A5: Regenerate recovery codes (requires valid TOTP code to authorize)
router.post(
  "/2fa/regen-recovery",
  twoFactorLimiter,
  authenticate,
  validate(regenRecoveryCodesSchema),
  async (req, res, next) => {
    try {
      const { code } = req.body;
      const userId = req.user!.id;

      const totpOk = await verifyTotpCode(userId, code);
      if (!totpOk) throw new AppError(401, "Invalid TOTP code");

      const recoveryCodes = await regenerateRecoveryCodes(userId);
      res.json({ success: true, data: { recoveryCodes } });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
