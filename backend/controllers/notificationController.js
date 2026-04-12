import Notification from "../models/Notification.js";
import { getIO } from "../src/loaders/socket.js";
import { logger } from "../src/config/logger.js";

function emitNew(userId, doc) {
  try {
    const io = getIO();
    if (!io) return;
    const payload = {
      id: String(doc._id),
      _id: String(doc._id),
      userId: String(doc.userId),
      type: doc.type,
      message: doc.message,
      data: doc.data || {},
      read: !!doc.read,
      isRead: !!doc.read,
      createdAt: doc.createdAt,
    };
    io.of("/notifications").to(`user:${String(userId)}`).emit("notification:new", payload);
  } catch (e) {
    logger.warn("[notifications] emit:", e.message);
  }
}

export async function createNotification(req, res) {
  try {
    const { userId, type, message, data } = req.body || {};
    if (!userId || !type || message == null) {
      return res.status(400).json({ ok: false, error: "userId, type, message required" });
    }
    const doc = await Notification.create({
      userId,
      type: String(type),
      message: String(message),
      data: data && typeof data === "object" ? data : {},
    });
    emitNew(userId, doc);
    res.status(201).json({
      ok: true,
      notification: {
        id: String(doc._id),
        userId: String(doc.userId),
        type: doc.type,
        message: doc.message,
        data: doc.data,
        read: doc.read,
        createdAt: doc.createdAt,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function getUserNotifications(req, res) {
  try {
    const { userId } = req.params;
    const uid = String(req.user?.id || req.user?._id || "");
    if (!uid || String(userId) !== uid) {
      return res.status(403).json({ ok: false, error: "Forbidden" });
    }
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const rows = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    const notifications = rows.map((n) => ({
      id: String(n._id),
      userId: String(n.userId),
      type: n.type,
      message: n.message,
      data: n.data,
      read: n.read,
      isRead: n.read,
      createdAt: n.createdAt,
    }));
    res.json({ ok: true, notifications, unreadCount });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const uid = String(req.user?.id || req.user?._id || "");
    if (!uid) return res.status(401).json({ ok: false, error: "Unauthorized" });
    const doc = await Notification.findOneAndUpdate(
      { _id: id, userId: uid, read: false },
      { read: true },
      { new: true }
    ).lean();
    if (!doc) {
      const exists = await Notification.findOne({ _id: id, userId: uid }).lean();
      if (!exists) return res.status(404).json({ ok: false, error: "Not found" });
      return res.json({ ok: true, notification: { id: String(exists._id), read: true, isRead: true } });
    }
    res.json({
      ok: true,
      notification: {
        id: String(doc._id),
        read: true,
        isRead: true,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
