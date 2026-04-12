import Message from "../models/Message.js";

function shapeMessage(doc) {
  return {
    id: doc._id,
    _id: doc._id,
    conversation: doc.conversation,
    sender: doc.sender,
    content: doc.content || doc.text || "",
    media: doc.media || [],
    replyTo: doc.replyTo || null,
    reactions: doc.reactions || [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listMessages(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
    const query = { isDeleted: { $ne: true } };
    if (req.query.conversation) query.conversation = req.query.conversation;
    const items = await Message.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    const messages = items.reverse().map(shapeMessage);
    return res.json({ ok: true, messages });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message, messages: [] });
  }
}

export async function getMessageById(req, res) {
  try {
    const item = await Message.findById(req.params.id).lean();
    if (!item || item.isDeleted) return res.status(404).json({ ok: false, message: "Message not found" });
    return res.json({ ok: true, message: shapeMessage(item) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

export async function createMessage(req, res) {
  try {
    const sender = req.user?.id || req.user?._id || req.body?.sender;
    const { conversation, content, media, replyTo } = req.body || {};
    if (!sender || !conversation) {
      return res.status(400).json({ ok: false, message: "sender and conversation are required" });
    }
    if (!content && !media) {
      return res.status(400).json({ ok: false, message: "content or media required" });
    }

    const created = await Message.create({
      sender,
      conversation,
      content: content || "",
      media: Array.isArray(media) ? media : [],
      replyTo: replyTo || null,
    });
    return res.status(201).json({ ok: true, message: shapeMessage(created) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

export async function updateMessage(req, res) {
  try {
    const item = await Message.findById(req.params.id);
    if (!item || item.isDeleted) return res.status(404).json({ ok: false, message: "Message not found" });

    const userId = req.user?.id || req.user?._id;
    if (userId && String(item.sender) !== String(userId)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    if (req.body?.content !== undefined) item.content = req.body.content;
    if (req.body?.media !== undefined) item.media = Array.isArray(req.body.media) ? req.body.media : [];
    await item.save();
    return res.json({ ok: true, message: shapeMessage(item) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

export async function deleteMessage(req, res) {
  try {
    const item = await Message.findById(req.params.id);
    if (!item || item.isDeleted) return res.status(404).json({ ok: false, message: "Message not found" });

    const userId = req.user?.id || req.user?._id;
    if (userId && String(item.sender) !== String(userId)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    item.isDeleted = true;
    await item.save();
    return res.json({ ok: true, deleted: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
import Message from '../models/messageModel.js';

export const createMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    const newMessage = new Message({ sender, receiver, content });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create message', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.query;

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};
