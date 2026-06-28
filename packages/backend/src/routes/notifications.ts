import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate, validateQuery } from "../middleware/validate.js";
import { AppError } from "../middleware/error.js";
import {
  notificationIdParamSchema,
  paginationSchema,
  updateNotificationPreferenceSchema,
} from "@spanish-class/shared";
import {
  addSSEConnection,
  removeSSEConnection,
  markRead,
  markAllRead,
  getNotifications,
} from "../services/notifications.js";
import { NOTIFICATION_TYPES } from "../lib/notificationTypes.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.use(authenticate);

// GET /api/notifications — paginated list of notifications (N4)
router.get("/", validateQuery(paginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const { notifications, total } = await getNotifications(req.user!.id, page, limit);
    res.json({
      success: true,
      data: { notifications },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/preferences — list per-type preferences (N2)
router.get("/preferences", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const prefs = await prisma.notificationPreference.findMany({
      where: { userId },
    });
    const prefMap = new Map(prefs.map((p) => [p.type, p.enabled]));
    const result = NOTIFICATION_TYPES.map((t) => ({
      type: t.type,
      label: t.label,
      enabled: prefMap.get(t.type) ?? true, // default = enabled
    }));
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/preferences — update a single preference (N2)
router.put(
  "/preferences",
  validate(updateNotificationPreferenceSchema),
  async (req, res, next) => {
    try {
      const { type, enabled } = req.body;
      const userId = req.user!.id;

      await prisma.notificationPreference.upsert({
        where: { userId_type: { userId, type } },
        update: { enabled },
        create: { userId, type, enabled },
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
);

// PUT /api/notifications/:id/read — mark one as read
router.put("/:id/read", async (req, res, next) => {
  try {
    const parsed = notificationIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors[0].message);
    }
    await markRead(parsed.data.id, req.user!.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/read-all — mark all as read
router.post("/read-all", async (req, res, next) => {
  try {
    await markAllRead(req.user!.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/stream — SSE endpoint (no body/query to validate)
router.get("/stream", (req, res) => {
  const userId = req.user!.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write("event: connected\ndata: {}\n\n");

  addSSEConnection(userId, res);

  const keepalive = setInterval(() => {
    try {
      res.write(":\n\n");
    } catch {
      clearInterval(keepalive);
    }
  }, 25_000);

  req.on("close", () => {
    clearInterval(keepalive);
    removeSSEConnection(userId, res);
  });
});

export default router;
