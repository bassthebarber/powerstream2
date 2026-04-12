/**
 * Reels API — MongoDB Post model (channel: reel)
 * GET /api/reels, POST /api/reels, like, comments
 */
import { Post } from "../src/domain/models/index.js";
import Comment from "../models/Comment.js";
import { POST_CHANNELS } from "../src/domain/models/Post.model.js";

function shapeReel(doc, currentUserId) {
  const owner = doc.owner;
  const isPopulated = owner && typeof owner === "object";
  return {
    id: doc._id.toString(),
    _id: doc._id,
    user_id: isPopulated ? owner._id?.toString() : (owner?.toString?.() || doc.owner),
    username: isPopulated ? (owner.name || owner.username || owner.email || "User") : "User",
    caption: doc.caption || doc.text || "",
    videoUrl: doc.mediaUrl || doc.playbackUrl || (doc.media?.[0]?.url),
    thumbnailUrl: doc.thumbnailUrl || (doc.media?.[0]?.thumbnailUrl),
    created_at: doc.createdAt,
    viewsCount: doc.viewsCount ?? 0,
    likesCount: doc.likesCount ?? 0,
    commentsCount: doc.commentsCount ?? 0,
    likes: (doc.likedBy || []).map((id) => id?.toString?.() || id),
    liked: !!currentUserId && (doc.likedBy || []).some((id) => (id?.toString?.() || id) === (currentUserId?.toString?.() || currentUserId)),
  };
}

export async function getReels(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = parseInt(req.query.skip, 10) || 0;
    const userId = req.user?.id || req.user?._id;

    const posts = await Post.find({
      channel: POST_CHANNELS.REEL,
      isDeleted: { $ne: true },
      visibility: "public",
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username email avatarUrl")
      .lean();

    const shaped = posts.map((p) => shapeReel(p, userId));
    return res.json({ ok: true, reels: shaped, data: shaped });
  } catch (err) {
    console.error("[reels] getReels", err);
    return res.status(500).json({ ok: false, error: err.message, reels: [] });
  }
}

export async function createReel(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const { caption, video_url, media_url, thumbnail_url } = req.body || {};
    const videoUrl = video_url || media_url;
    if (!videoUrl) return res.status(400).json({ ok: false, message: "video_url or media_url required" });

    const post = await Post.create({
      owner: userId,
      channel: POST_CHANNELS.REEL,
      type: "video",
      caption: caption || "",
      text: caption || "",
      mediaUrl: videoUrl,
      mediaType: "video",
      thumbnailUrl: thumbnail_url || null,
      playbackUrl: videoUrl,
    });

    const populated = await Post.findById(post._id).populate("owner", "name username email avatarUrl").lean();
    return res.status(201).json({ ok: true, reel: shapeReel(populated, userId), data: populated });
  } catch (err) {
    console.error("[reels] createReel", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function likeReel(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const post = await Post.findOne({ _id: req.params.id, channel: POST_CHANNELS.REEL });
    if (!post) return res.status(404).json({ ok: false, message: "Reel not found" });

    const idStr = userId.toString();
    const likedBy = (post.likedBy || []).map((id) => (id?.toString?.() || id));
    const idx = likedBy.indexOf(idStr);
    if (idx >= 0) {
      post.likedBy.pull(userId);
      post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
    } else {
      post.likedBy.push(userId);
      post.likesCount = (post.likesCount || 0) + 1;
    }
    await post.save();

    return res.json({ ok: true, liked: idx < 0, likesCount: post.likesCount });
  } catch (err) {
    console.error("[reels] likeReel", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function getReelComments(req, res) {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "name username avatarUrl")
      .sort({ createdAt: 1 })
      .lean();

    const shaped = comments.map((c) => ({
      id: c._id.toString(),
      author: c.author ? { name: c.author.name || c.author.username } : { name: "User" },
      content: c.content,
      createdAt: c.createdAt,
    }));

    return res.json({ ok: true, comments: shaped });
  } catch (err) {
    console.error("[reels] getReelComments", err);
    return res.status(500).json({ ok: false, comments: [] });
  }
}

export async function commentOnReel(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const { content, text } = req.body || {};
    const body = content || text;
    if (!body || !body.trim()) return res.status(400).json({ ok: false, message: "content required" });

    const post = await Post.findOne({ _id: req.params.id, channel: POST_CHANNELS.REEL });
    if (!post) return res.status(404).json({ ok: false, message: "Reel not found" });

    const comment = await Comment.create({
      author: userId,
      post: req.params.id,
      content: body.trim(),
    });

    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });

    const populated = await Comment.findById(comment._id).populate("author", "name username avatarUrl").lean();
    return res.status(201).json({
      ok: true,
      comment: {
        id: populated._id.toString(),
        author: populated.author ? { name: populated.author.name || populated.author.username } : { name: "User" },
        content: populated.content,
        createdAt: populated.createdAt,
      },
    });
  } catch (err) {
    console.error("[reels] commentOnReel", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function getReelById(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    const reel = await Post.findOne({
      _id: req.params.id,
      channel: POST_CHANNELS.REEL,
      isDeleted: { $ne: true },
    })
      .populate("owner", "name username email avatarUrl")
      .lean();
    if (!reel) return res.status(404).json({ ok: false, message: "Reel not found" });
    return res.json({ ok: true, reel: shapeReel(reel, userId) });
  } catch (err) {
    console.error("[reels] getReelById", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updateReel(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const reel = await Post.findOne({ _id: req.params.id, channel: POST_CHANNELS.REEL });
    if (!reel) return res.status(404).json({ ok: false, message: "Reel not found" });
    if ((reel.owner?.toString?.() || String(reel.owner)) !== String(userId)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const { caption, media_url, video_url, thumbnail_url } = req.body || {};
    if (caption !== undefined) {
      reel.caption = caption;
      reel.text = caption;
    }
    if (media_url !== undefined || video_url !== undefined) {
      const nextUrl = video_url || media_url;
      reel.mediaUrl = nextUrl;
      reel.playbackUrl = nextUrl;
    }
    if (thumbnail_url !== undefined) reel.thumbnailUrl = thumbnail_url;
    await reel.save();

    const updated = await Post.findById(reel._id).populate("owner", "name username email avatarUrl").lean();
    return res.json({ ok: true, reel: shapeReel(updated, userId) });
  } catch (err) {
    console.error("[reels] updateReel", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deleteReel(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const reel = await Post.findOne({ _id: req.params.id, channel: POST_CHANNELS.REEL });
    if (!reel) return res.status(404).json({ ok: false, message: "Reel not found" });
    if ((reel.owner?.toString?.() || String(reel.owner)) !== String(userId)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    reel.isDeleted = true;
    reel.isPublished = false;
    await reel.save();
    return res.json({ ok: true, deleted: true });
  } catch (err) {
    console.error("[reels] deleteReel", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
