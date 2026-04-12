/**
 * PowerFeed API — Supabase feed_posts only (post_type: feed, gram, reel, etc.).
 * @see docs/MIGRATION_SUPABASE_PRIMARY.md
 */
import { getSupabaseAdmin } from "../src/services/supabaseAdmin.js";

const sb = () => getSupabaseAdmin();

export async function getPosts(req, res) {
  try {
    const client = sb();
    if (!client) {
      return res.status(503).json({
        ok: false,
        code: "SUPABASE_REQUIRED",
        message: "PowerFeed requires Supabase feed_posts.",
      });
    }
    const type = req.query.post_type || req.query.type;
    const limit = Math.min(parseInt(req.query.limit, 10) || 40, 100);
    let q = client
      .from("feed_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (type) q = q.eq("post_type", type);
    const { data, error } = await q;
    if (error) throw error;
    return res.json({ ok: true, posts: data || [], data: data || [] });
  } catch (e) {
    console.error("[powerFeed] getPosts", e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function createPost(req, res) {
  try {
    const client = sb();
    if (!client) {
      return res.status(503).json({ ok: false, message: "Supabase required" });
    }
    const uid = String(req.user?.id || req.user?._id || "");
    const { content, media_url, post_type = "feed", station_slug, track_name } = req.body || {};
    if (!content && !media_url) {
      return res.status(400).json({ ok: false, message: "content or media_url required" });
    }
    const row = {
      user_id: uid,
      username: req.user?.name || req.user?.email || "",
      post_type,
      content: content || "",
      media_url: media_url || null,
      station_slug: station_slug || null,
      track_name: track_name || null,
    };
    const { data, error } = await client.from("feed_posts").insert(row).select("*").single();
    if (error) throw error;
    try {
      const { notifyFollowersNewContent } = await import("../services/notificationService.js");
      await notifyFollowersNewContent(
        uid,
        data.id,
        post_type === "feed" ? "feed" : post_type,
        req.user?.name || ""
      );
    } catch {
      /* non-fatal */
    }
    return res.status(201).json({ ok: true, post: data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function reactToPost(req, res) {
  return res.status(501).json({
    ok: false,
    message: "Reactions: update feed_posts.reactions via Supabase or dedicated endpoint (TODO).",
  });
}

export async function commentOnPost(req, res) {
  return res.status(501).json({
    ok: false,
    message: "Comments: use feed_posts.comments JSON or separate table (TODO).",
  });
}
