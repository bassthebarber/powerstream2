/**
 * PowerGram — Supabase feed_posts (post_type = 'gram') only.
 * @deprecated Mongo PowerGramPost model — see docs/MIGRATION_SUPABASE_PRIMARY.md
 */
import { getSupabaseAdmin } from "../src/services/supabaseAdmin.js";

export const getGrams = async (req, res) => {
  try {
    const sb = getSupabaseAdmin();
    if (!sb) return res.status(503).json({ ok: false, message: "Supabase required" });
    const { data, error } = await sb
      .from("feed_posts")
      .select("*")
      .eq("post_type", "gram")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

export const createGram = async (req, res) => {
  try {
    const sb = getSupabaseAdmin();
    if (!sb) return res.status(503).json({ ok: false, message: "Supabase required" });
    const imageUrl = req.body?.imageUrl || req.body?.media_url;
    if (!imageUrl) {
      return res.status(400).json({ message: "imageUrl or media_url required (upload client-side then POST URL)" });
    }
    const uid = String(req.user._id || req.user.id);
    const { data, error } = await sb
      .from("feed_posts")
      .insert({
        user_id: uid,
        username: req.user.name || "",
        post_type: "gram",
        content: req.body.caption || "",
        media_url: imageUrl,
        media_type: "image",
      })
      .select("*")
      .single();
    if (error) throw error;
    try {
      const { notifyFollowersNewContent } = await import("../services/notificationService.js");
      await notifyFollowersNewContent(uid, data.id, "gram", req.user?.name || "");
    } catch {
      /* ignore */
    }
    res.status(201).json({ message: "Post created", post: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

export const likeGram = async (req, res) => {
  res.status(501).json({ ok: false, message: "Use feed_posts.reactions (TODO)" });
};

export const getGramComments = async (req, res) => {
  res.json([]);
};

export const commentOnGram = async (req, res) => {
  res.status(501).json({ ok: false, message: "TODO comments" });
};
