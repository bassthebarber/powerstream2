import { logger } from "../src/config/logger.js";

function nowIso() {
  return new Date().toISOString();
}

/**
 * GET /api/stories
 * Graceful response even when story persistence is not configured.
 */
export async function listStories(_req, res) {
  try {
    return res.json({
      ok: true,
      stories: [],
      count: 0,
      message: "Stories available",
      timestamp: nowIso(),
    });
  } catch (error) {
    logger.warn("[stories] list failed", { error: error.message });
    return res.status(500).json({ ok: false, error: "Failed to load stories", stories: [] });
  }
}

/**
 * POST /api/stories
 * Placeholder-safe create endpoint to prevent route mount/runtime crashes.
 */
export async function createStory(req, res) {
  try {
    const { mediaUrl, text } = req.body || {};
    const userId = String(req.user?.id || req.user?._id || "");
    if (!userId) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }
    if (!mediaUrl && !text) {
      return res.status(400).json({ ok: false, error: "mediaUrl or text is required" });
    }

    return res.status(201).json({
      ok: true,
      story: {
        id: `story_${Date.now()}`,
        userId,
        mediaUrl: mediaUrl || null,
        text: text || "",
        createdAt: nowIso(),
      },
    });
  } catch (error) {
    logger.error("[stories] create failed", { error: error.message });
    return res.status(500).json({ ok: false, error: "Failed to create story" });
  }
}

export default { listStories, createStory };
