import "./config/env.js";
import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { authLimiter, generalLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/auth.js";
import professorRoutes from "./routes/professor.js";
import studentRoutes from "./routes/student.js";

const app: Express = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

// Trust Caddy (first proxy) so req.ip is the real client IP from X-Forwarded-For.
// '1' means trust exactly one proxy hop, which matches our Caddy → backend topology.
app.set("trust proxy", 1);

// ── Security headers ──────────────────────────────────────────────────────────
// Helmet sets X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
// Referrer-Policy, and more. CSP is managed by Caddy; disable helmet's copy
// to avoid conflict. HSTS is also set by Caddy + Cloudflare; leave off here.
app.use(
  helmet({
    contentSecurityPolicy: false,
    strictTransportSecurity: false,
  }),
);

// ── CORS ──────────────────────────────────────────────────────────────────────
// CORS_ALLOWED_ORIGINS is a comma-separated list of allowed origins.
// Falls back to FRONTEND_URL for backward compat, then localhost for local dev.
// In production the env MUST be set; we fail-closed (no origin allowed) if not.
const rawOrigins = process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL;
const allowedOrigins: string[] = rawOrigins
  ? rawOrigins.split(",").map((o) => o.trim()).filter(Boolean)
  : isProd
    ? []
    : ["http://localhost", "http://localhost:5173", "http://localhost:3001"];

if (isProd && allowedOrigins.length === 0) {
  console.error(
    "[CORS] CORS_ALLOWED_ORIGINS is not set in production. No cross-origin requests will be allowed.",
  );
}

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin requests (no Origin header: curl, server-to-server)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ── Rate limiting ─────────────────────────────────────────────────────────────
// generalLimiter covers non-auth /api routes.
// authLimiter is applied directly inside the auth router on sensitive endpoints.
app.use("/api", (req, res, next) => {
  // Skip general limiter for auth routes — authLimiter handles those directly.
  if (req.path.startsWith("/auth")) return next();
  return generalLimiter(req, res, next);
});

// ── Health (no auth, no rate limit — used by compose + UptimeRobot) ───────────
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/professor", professorRoutes);
app.use("/api/student", studentRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS origins: ${allowedOrigins.join(", ") || "(none — fail-closed)"}`);
});

export default app;
