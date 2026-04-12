import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from "../services/notificationService.js";

const router = Router();

function userId(req) {
  return String(req.user?.id || req.user?._id || req.userId || "");
}

/** GET /api/v2/notifications */
router.get("/", requireAuth, async (req, res) => {
  try {
    const uid = userId(req);
    if (!uid) return res.status(401).json({ ok: false, error: "Unauthorized" });
    const limit = req.query.limit;
    const unreadOnly = req.query.unreadOnly === "true" || req.query.unread === "1";
    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(uid, { limit, unreadOnly }),
      getUnreadCount(uid),
    ]);
    res.json({
      ok: true,
      notifications,
      unreadCount,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/** GET /api/v2/notifications/unread-count */
router.get("/unread-count", requireAuth, async (req, res) => {
  try {
    const uid = userId(req);
    if (!uid) return res.status(401).json({ ok: false });
    const unreadCount = await getUnreadCount(uid);
    res.json({ ok: true, unreadCount });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * POST /api/v2/notifications/read
 * Body: { notificationId } | { markAll: true }
 */
router.post("/read", requireAuth, async (req, res) => {
  try {
    const uid = userId(req);
    if (!uid) return res.status(401).json({ ok: false, error: "Unauthorized" });
    if (req.body?.markAll) {
      const n = await markAllRead(uid);
      return res.json({ ok: true, marked: n });
    }
    const id = req.body?.notificationId || req.body?.id;
    if (!id) {
      return res.status(400).json({ ok: false, error: "notificationId required" });
    }
    const ok = await markAsRead(id, uid);
    if (!ok) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
