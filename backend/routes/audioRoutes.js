import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getSupabaseAdmin } from "../src/services/supabaseAdmin.js";

const router = Router();

router.get("/health", (req, res) => res.json({ ok: true, service: "audio" }));

router.get("/tracks", async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.json({ ok: true, tracks: [], message: "Supabase not configured" });
    }
    const { data, error } = await supabase
      .from("feed_posts")
      .select("id, user_id, username, track_name, media_url, content, created_at")
      .eq("post_type", "audio")
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) throw error;
    return res.json({ ok: true, tracks: data || [] });
  } catch (e) {
    console.error("[audio] tracks", e.message);
    return res.json({ ok: true, tracks: [] });
  }
});

router.post("/publish", requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ ok: false, error: "Supabase required for audio feed posts" });
    }
    const { media_url, track_name, content } = req.body || {};
    if (!media_url?.trim()) {
      return res.status(400).json({ ok: false, error: "media_url required" });
    }
    const { error } = await supabase.from("feed_posts").insert({
      user_id: String(req.user._id),
      username: req.user.name || "",
      post_type: "audio",
      media_url: media_url.trim(),
      track_name: (track_name || "Track").slice(0, 200),
      content: content || "",
    });
    if (error) throw error;
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
