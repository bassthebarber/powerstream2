/**
 * Feed API — MongoDB Post model (channel: feed)
 * GET /api/feed, POST /api/feed, like, comments
 */
import { Post, User } from "../src/domain/models/index.js";
import Comment from "../models/Comment.js";
import { POST_CHANNELS } from "../src/domain/models/Post.model.js";

function shapePostForFeed(doc, currentUserId) {
  const owner = doc.owner;
  const isPopulated = owner && typeof owner === "object";
  return {
    id: doc._id.toString(),
    _id: doc._id,
    user_id: isPopulated ? owner._id?.toString() : (owner?.toString?.() || doc.owner),
    username: isPopulated ? (owner.name || owner.username || owner.email || "User") : "User",
    content: doc.text || doc.caption || "",
    media_url: doc.mediaUrl || (doc.media?.[0]?.url) || null,
    media_type: doc.mediaType || (doc.media?.[0]?.type) || null,
    created_at: doc.createdAt,
    likesCount: doc.likesCount ?? 0,
    commentsCount: doc.commentsCount ?? 0,
    reactions: (doc.likedBy || []).reduce((acc, id) => {
      acc[id?.toString?.() || id] = "like";
      return acc;
    }, {}),
    liked: !!currentUserId && (doc.likedBy || []).some((id) => (id?.toString?.() || id) === (currentUserId?.toString?.() || currentUserId)),
    comments: [],
  };
}

export async function getFeed(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = parseInt(req.query.skip, 10) || 0;
    const userId = req.user?.id || req.user?._id;

    const query = {
      channel: POST_CHANNELS.FEED,
      isDeleted: { $ne: true },
      visibility: "public",
      isPublished: true,
    };

    if (userId) {
      const user = await User.findById(userId).select("following").lean();
      const followingIds = user?.following || [];
      const ownerIds = [userId, ...followingIds];
      if (ownerIds.length > 1) {
        query.owner = { $in: ownerIds };
      }
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "name username email avatarUrl")
      .lean();

    const shaped = posts.map((p) => shapePostForFeed(p, userId));
    return res.json({ ok: true, posts: shaped, data: shaped });
  } catch (err) {
    console.error("[feed] getFeed", err);
    return res.status(500).json({ ok: false, error: err.message, posts: [] });
  }
}

export async function createPost(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const { content, media_url, media_type } = req.body || {};
    const post = await Post.create({
      owner: userId,
      channel: POST_CHANNELS.FEED,
      type: media_url ? (media_type || "image") : "text",
      text: content || "",
      caption: content || "",
      mediaUrl: media_url || null,
      mediaType: media_type || null,
    });

    const populated = await Post.findById(post._id).populate("owner", "name username email avatarUrl").lean();
    return res.status(201).json({ ok: true, post: shapePostForFeed(populated, userId), data: populated });
  } catch (err) {
    console.error("[feed] createPost", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function toggleLike(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ ok: false, message: "Post not found" });

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

    return res.json({
      ok: true,
      liked: idx < 0,
      likesCount: post.likesCount,
    });
  } catch (err) {
    console.error("[feed] toggleLike", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function getComments(req, res) {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "name username avatarUrl")
      .sort({ createdAt: 1 })
      .lean();

    const shaped = comments.map((c) => ({
      id: c._id.toString(),
      author: c.author ? { name: c.author.name || c.author.username, avatarUrl: c.author.avatarUrl } : { name: "User" },
      content: c.content,
      createdAt: c.createdAt,
    }));

    return res.json({ ok: true, comments: shaped });
  } catch (err) {
    console.error("[feed] getComments", err);
    return res.status(500).json({ ok: false, comments: [] });
  }
}

export async function addComment(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const { content, text } = req.body || {};
    const body = content || text;
    if (!body || !body.trim()) return res.status(400).json({ ok: false, message: "content required" });

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
    console.error("[feed] addComment", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function getFeedPostById(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    const post = await Post.findOne({
      _id: req.params.id,
      channel: POST_CHANNELS.FEED,
      isDeleted: { $ne: true },
    })
      .populate("owner", "name username email avatarUrl")
      .lean();

    if (!post) return res.status(404).json({ ok: false, message: "Post not found" });
    return res.json({ ok: true, post: shapePostForFeed(post, userId) });
  } catch (err) {
    console.error("[feed] getFeedPostById", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function updateFeedPost(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const post = await Post.findOne({ _id: req.params.id, channel: POST_CHANNELS.FEED });
    if (!post) return res.status(404).json({ ok: false, message: "Post not found" });
    if ((post.owner?.toString?.() || String(post.owner)) !== String(userId)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const { content, media_url, media_type } = req.body || {};
    if (content !== undefined) {
      post.text = content;
      post.caption = content;
    }
    if (media_url !== undefined) post.mediaUrl = media_url;
    if (media_type !== undefined) post.mediaType = media_type;
    await post.save();

    const updated = await Post.findById(post._id).populate("owner", "name username email avatarUrl").lean();
    return res.json({ ok: true, post: shapePostForFeed(updated, userId) });
  } catch (err) {
    console.error("[feed] updateFeedPost", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export async function deleteFeedPost(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ ok: false, message: "Authentication required" });

    const post = await Post.findOne({ _id: req.params.id, channel: POST_CHANNELS.FEED });
    if (!post) return res.status(404).json({ ok: false, message: "Post not found" });
    if ((post.owner?.toString?.() || String(post.owner)) !== String(userId)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    post.isDeleted = true;
    post.isPublished = false;
    await post.save();
    return res.json({ ok: true, deleted: true });
  } catch (err) {
    console.error("[feed] deleteFeedPost", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
