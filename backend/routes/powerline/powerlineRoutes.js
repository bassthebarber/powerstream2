/**
 * PowerLine API — Supabase line_messages ONLY.
 * Legacy Mongo chats/threads/messages removed. See docs/MIGRATION_SUPABASE_PRIMARY.md
 */
import { Router } from "express";
import { requireAuth, authOptional } from "../../middleware/authMiddleware.js";
import {
  isLineMessengerEnabled,
  listThreadsForUser,
  listMessages,
  sendLineMessage,
  ensureDmThread,
} from "../../services/lineMessages/lineMessagesService.js";

const router = Router();

const LEGACY = {
  success: false,
  code: "POWERLINE_SUPABASE_ONLY",
  message:
    "PowerLine uses Supabase line_messages only. Use /api/powerline/messenger/*. Configure SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.",
};

function legacyBlocked(_req, res) {
  res.status(503).json(LEGACY);
}

// Explicit legacy path stubs (clients receive clear upgrade signal)
router.get("/chats", requireAuth, legacyBlocked);
router.post("/chats", requireAuth, legacyBlocked);
router.get("/chats/:chatId", requireAuth, legacyBlocked);
router.get("/chats/:chatId/messages", requireAuth, legacyBlocked);
router.post("/chats/:chatId/messages", requireAuth, legacyBlocked);
router.get("/messages/:chatId", requireAuth, legacyBlocked);
router.post("/messages/:chatId", requireAuth, legacyBlocked);
router.get("/threads", authOptional, legacyBlocked);
router.post("/threads", requireAuth, legacyBlocked);
router.get("/threads/:id/messages", requireAuth, legacyBlocked);
router.post("/threads/:id/messages", requireAuth, legacyBlocked);

// —— Supabase line_messages ——
router.get("/messenger/status", requireAuth, (req, res) => {
  res.json({
    ok: true,
    lineMessagesEnabled: isLineMessengerEnabled(),
    primaryDatabase: "supabase",
  });
});

router.get("/messenger/threads", requireAuth, async (req, res) => {
  try {
    if (!isLineMessengerEnabled()) {
      return res.status(503).json({
        ok: false,
        code: "SUPABASE_REQUIRED",
        message: "Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for line_messages.",
      });
    }
    const threads = await listThreadsForUser(req.user._id);
    return res.json({
      success: true,
      ok: true,
      threads,
      data: threads,
      count: threads.length,
    });
  } catch (err) {
    console.error("[PowerLine] messenger/threads", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/messenger/dm", requireAuth, async (req, res) => {
  try {
    if (!isLineMessengerEnabled()) {
      return res.status(503).json({ ok: false, message: "Supabase required" });
    }
    const { otherUserId } = req.body || {};
    if (!otherUserId) {
      return res.status(400).json({ ok: false, message: "otherUserId required" });
    }
    const { threadId, other } = await ensureDmThread(req.user._id, otherUserId);
    return res.json({
      ok: true,
      threadId,
      thread: {
        _id: threadId,
        id: threadId,
        threadId,
        title: other.name,
        participants: [
          { _id: String(req.user._id), name: "You" },
          {
            _id: other._id,
            name: other.name,
            email: other.email || "",
            avatarUrl: other.avatarUrl,
          },
        ],
        source: "line_messages",
      },
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ ok: false, message: err.message });
  }
});

router.get("/messenger/threads/:threadId/messages", requireAuth, async (req, res) => {
  try {
    if (!isLineMessengerEnabled()) {
      return res.status(503).json({ ok: false, message: "Supabase required" });
    }
    const items = await listMessages(req.params.threadId, req.user._id, {
      limit: req.query.limit || 100,
    });
    return res.json({
      success: true,
      ok: true,
      messages: items,
      data: items,
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
});

router.post("/messenger/threads/:threadId/messages", requireAuth, async (req, res) => {
  try {
    if (!isLineMessengerEnabled()) {
      return res.status(503).json({ ok: false, message: "Supabase required" });
    }
    const { text } = req.body || {};
    const saved = await sendLineMessage(req.params.threadId, req.user._id, text);
    const io = req.app?.get?.("io");
    const tid = req.params.threadId;
    if (io && saved) {
      io.to(`thread:${tid}`).emit("message:new", { ...saved, threadId: tid });
      io.of("/powerline").to(`thread:${tid}`).emit("message:new", { ...saved, threadId: tid });
    }
    return res.status(201).json({ success: true, ok: true, data: saved, message: saved });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
});

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "PowerLine (Supabase line_messages)",
    version: "v6-supabase",
    endpoints: [
      "GET /api/powerline/messenger/status",
      "GET /api/powerline/messenger/threads",
      "POST /api/powerline/messenger/dm",
      "GET/POST /api/powerline/messenger/threads/:threadId/messages",
    ],
  });
});

export default router;
