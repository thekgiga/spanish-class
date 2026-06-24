import rateLimit from "express-rate-limit";

// Strict limiter for authentication endpoints.
// 10 attempts per 15 min per IP. Returns 429 with Retry-After header.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
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
