/**
 * Gram API — MongoDB Post model (channel: gram)
 * GET /api/gram, POST /api/gram, like, comments
 */
import { Post } from "../src/domain/models/index.js";
import Comment from "../models/Comment.js";
import { POST_CHANNELS } from "../src/domain/models/Post.model.js";

function shapeGram(doc, currentUserId) {
  const owner = doc.owner;
  const isPopulated = owner && typeof owner === "object";
  return {
    id: doc._id.toString(),
    _id: doc._id,
    user_id: isPopulated ? owner._id?.toString() : (owner?.toString?.() || doc.owner),
    username: isPopulated ? (owner.name || owner.username || owner.email || "User") : "User",
    caption: doc.caption || doc.text || "",
    media_url: doc.mediaUrl || (doc.media?.[0]?.url) || null,
    media_type: doc.mediaType || (doc.media?.[0]?.type) || "image",
    created_at: doc.createdAt,
    likesCount: doc.likesCount ?? 0,
    commentsCount: doc.commentsCount ?? 0,
    likes: (doc.likedBy || []).map((id) => id?.toString?.() || id),
    liked: !!currentUserId && (doc.likedBy || []).some((id) => (id?.toString?.() || id) === (currentUserId?.toString?.() || currentUserId)),
    comments: [],
  };
}

export async function getGrams(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const skip = parseInt(req.query.skip, 10) || 0;
    const userId = req.user?.id || req.user?._id;

    const posts = await Post.find({
      channel: POST_CHANNELS.GRAM,
      isDeleted: { $ne: true },
      visibility: "public",
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username email avatarUrl")
      .lean();

    const shaped = posts.map((p) => shapeGram(p, userId));
    return res.json({ ok: true, grams: shaped, data: shaped });
  } catch (err) {
    console.error("[gram] getGrams", err);
    return res.status(500).json({ ok: false, error: err.message, grams: [] });
  }
}

export async function createGram(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const { caption, media_url, media_type } = req.body || {};
    const post = await Post.create({
      owner: userId,
      channel: POST_CHANNELS.GRAM,
      type: media_url ? (media_type || "image") : "text",
      caption: caption || "",
      text: caption || "",
      mediaUrl: media_url || null,
      mediaType: media_type || "image",
    });

    const populated = await Post.findById(post._id).populate("owner", "name username email avatarUrl").lean();
    return res.status(201).json({ ok: true, gram: shapeGram(populated, userId), data: populated });
  } catch (err) {
    console.error("[gram] createGram", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function likeGram(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const post = await Post.findOne({ _id: req.params.id, channel: POST_CHANNELS.GRAM });
    if (!post) return res.status(404).json({ ok: false, message: "Gram not found" });

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
    console.error("[gram] likeGram", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function getGramComments(req, res) {
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
    console.error("[gram] getGramComments", err);
    return res.status(500).json({ ok: false, comments: [] });
  }
}

export async function commentOnGram(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const { content, text } = req.body || {};
    const body = content || text;
    if (!body || !body.trim()) return res.status(400).json({ ok: false, message: "content required" });

    const post = await Post.findOne({ _id: req.params.id, channel: POST_CHANNELS.GRAM });
    if (!post) return res.status(404).json({ ok: false, message: "Gram not found" });

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
    console.error("[gram] commentOnGram", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function getGramById(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    const gram = await Post.findOne({
      _id: req.params.id,
      channel: POST_CHANNELS.GRAM,
      isDeleted: { $ne: true },
    })
      .populate("owner", "name username email avatarUrl")
      .lean();
    if (!gram) return res.status(404).json({ ok: false, message: "Gram not found" });
    return res.json({ ok: true, gram: shapeGram(gram, userId) });
  } catch (err) {
    console.error("[gram] getGramById", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updateGram(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const gram = await Post.findOne({ _id: req.params.id, channel: POST_CHANNELS.GRAM });
    if (!gram) return res.status(404).json({ ok: false, message: "Gram not found" });
    if ((gram.owner?.toString?.() || String(gram.owner)) !== String(userId)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const { caption, media_url, media_type } = req.body || {};
    if (caption !== undefined) {
      gram.caption = caption;
      gram.text = caption;
    }
    if (media_url !== undefined) gram.mediaUrl = media_url;
    if (media_type !== undefined) gram.mediaType = media_type;
    await gram.save();

    const updated = await Post.findById(gram._id).populate("owner", "name username email avatarUrl").lean();
    return res.json({ ok: true, gram: shapeGram(updated, userId) });
  } catch (err) {
    console.error("[gram] updateGram", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deleteGram(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const gram = await Post.findOne({ _id: req.params.id, channel: POST_CHANNELS.GRAM });
    if (!gram) return res.status(404).json({ ok: false, message: "Gram not found" });
    if ((gram.owner?.toString?.() || String(gram.owner)) !== String(userId)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    gram.isDeleted = true;
    gram.isPublished = false;
    await gram.save();
    return res.json({ ok: true, deleted: true });
  } catch (err) {
    console.error("[gram] deleteGram", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
