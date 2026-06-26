import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  addSSEConnection,
  removeSSEConnection,
  markRead,
  markAllRead,
  getNotifications,
} from "../services/notifications.js";

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// GET /api/notifications — list last 30 notifications
router.get("/", async (req, res, next) => {
  try {
    const notifications = await getNotifications(req.user!.id);
    res.json({ success: true, data: { notifications } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read — mark one as read
router.put("/:id/read", async (req, res, next) => {
  try {
    await markRead(req.params.id, req.user!.id);
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

// GET /api/notifications/stream — SSE endpoint
router.get("/stream", (req, res) => {
  const userId = req.user!.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
  res.flushHeaders();

  // Send initial "connected" ping
  res.write("event: connected\ndata: {}\n\n");

  addSSEConnection(userId, res);

  // Keepalive every 25 seconds to prevent proxy/browser timeout
  const keepalive = setInterval(() => {
    try {
      res.write(":\n\n"); // SSE comment = keepalive
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
