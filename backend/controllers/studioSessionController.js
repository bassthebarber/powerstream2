import StudioSession from "../recordingStudio/models/StudioSession.js";
import { logger } from "../src/config/logger.js";

function toView(s) {
  return {
    id: String(s._id),
    projectName: s.projectName || "Untitled",
    type: s.type || "recording",
    status: s.status || "draft",
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export async function saveSession(req, res) {
  try {
    const userId = String(req.user?.id || req.user?._id || "");
    if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const payload = req.body || {};
    const id = payload.id || payload._id;
    let doc;
    if (id) {
      doc = await StudioSession.findOneAndUpdate(
        { _id: id, userId },
        { $set: payload },
        { new: true }
      );
    } else {
      doc = await StudioSession.create({ ...payload, userId });
    }
    if (!doc) return res.status(404).json({ ok: false, error: "Session not found" });
    return res.json({ ok: true, session: toView(doc) });
  } catch (error) {
    logger.error("[studio sessions] save failed", { error: error.message });
    return res.status(500).json({ ok: false, error: "Failed to save session" });
  }
}

export async function listSessions(req, res) {
  try {
    const userId = String(req.user?.id || req.user?._id || "");
    if (!userId) return res.json({ ok: true, sessions: [], total: 0 });

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const items = await StudioSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
    return res.json({ ok: true, sessions: items.map(toView), total: items.length });
  } catch (error) {
    logger.warn("[studio sessions] list failed", { error: error.message });
    return res.status(500).json({ ok: false, sessions: [], total: 0, error: "Failed to load sessions" });
  }
}

export async function getSession(req, res) {
  try {
    const userId = String(req.user?.id || req.user?._id || "");
    if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const item = await StudioSession.findOne({ _id: req.params.id, userId }).lean();
    if (!item) return res.status(404).json({ ok: false, error: "Session not found" });
    return res.json({ ok: true, session: toView(item) });
  } catch (error) {
    logger.warn("[studio sessions] get failed", { error: error.message });
    return res.status(500).json({ ok: false, error: "Failed to load session" });
  }
}

export default { saveSession, listSessions, getSession };
