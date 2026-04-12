/**
 * PowerReel — Supabase feed_posts (post_type = 'reel').
 */
import { getSupabaseAdmin } from "../src/services/supabaseAdmin.js";

export async function getReels(req, res) {
  try {
    const sb = getSupabaseAdmin();
    if (!sb) return res.status(503).json({ ok: false, reels: [] });
    const { data, error } = await sb
      .from("feed_posts")
      .select("*")
      .eq("post_type", "reel")
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) throw error;
    res.json({ ok: true, reels: data || [] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function createReel(req, res) {
  try {
    const sb = getSupabaseAdmin();
    if (!sb) return res.status(503).json({ ok: false });
    const { media_url, content } = req.body || {};
    if (!media_url) return res.status(400).json({ ok: false, message: "media_url required" });
    const uid = String(req.user._id || req.user.id);
    const { data, error } = await sb
      .from("feed_posts")
      .insert({
        user_id: uid,
        username: req.user.name || "",
        post_type: "reel",
        content: content || "",
        media_url,
        media_type: "video",
      })
      .select("*")
      .single();
    if (error) throw error;
    try {
      const { notifyFollowersNewContent } = await import("../services/notificationService.js");
      await notifyFollowersNewContent(uid, data.id, "reel", req.user?.name || "");
    } catch {
      /* ignore */
    }
    res.status(201).json({ ok: true, reel: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function likeReel(req, res) {
  res.status(501).json({ ok: false, message: "Use feed_posts.reactions update (TODO)" });
}
export async function getReelComments(req, res) {
  res.json({ ok: true, comments: [] });
}
export async function commentOnReel(req, res) {
  res.status(501).json({ ok: false, message: "TODO comments" });
}
export async function incrementView(req, res) {
  res.json({ ok: true });
}
