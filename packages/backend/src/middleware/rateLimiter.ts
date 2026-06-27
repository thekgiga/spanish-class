import rateLimit from "express-rate-limit";

// Strict limiter for authentication endpoints.
// 50 attempts per 15 min per IP. Returns 429 with Retry-After header.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
});

// Very strict limiter for 2FA verification — 5 attempts per 15 min per IP.
// TOTP has only 1M combinations and recovery codes are finite; brute-force must be blocked hard.
export const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many 2FA attempts. Please try again later.",
  },
});

// Loose limiter for all other /api routes — blocks obvious flood attacks
// while still being generous to legitimate traffic (300 req / 5 min / IP).
export const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
});
