import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

const PII_KEYS = new Set([
  "password", "passwordHash", "password_hash", "token",
  "secret", "secretEncrypted", "credit_card", "ssn",
]);

function scrubPayload(obj: unknown, depth = 0): unknown {
  if (depth > 5 || obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((v) => scrubPayload(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = PII_KEYS.has(k) ? "[redacted]" : scrubPayload(v, depth + 1);
  }
  return out;
}

// Records every mutating admin request to admin_audit_logs.
// Non-blocking — failures log a warning but never kill the response.
export function auditAdmin(action: string, targetType?: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    next(); // proceed first — write audit async so we don't add latency

    const actorId = req.user?.id;
    if (!actorId || !req.user?.isAdmin) return;

    const targetId =
      req.params?.id ||
      req.params?.studentId ||
      req.params?.slotId ||
      undefined;

    const payload = scrubPayload({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    prisma.adminAuditLog
      .create({
        data: {
          actorId,
          action,
          targetType: targetType ?? null,
          targetId: targetId ?? null,
          ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
            ?? req.socket.remoteAddress
            ?? null,
          userAgent: (req.headers["user-agent"] as string) ?? null,
          payloadJson: JSON.stringify(payload),
        },
      })
      .catch((err: unknown) => {
        console.warn("[audit] failed to write audit log:", err);
      });
  };
}

// Convenience: auto-derive action from method + path
export function autoAudit(targetType?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return next();
    const action = `${method}:${req.route?.path || req.path}`;
    return auditAdmin(action, targetType)(req, res, next);
  };
}
