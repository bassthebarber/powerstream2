// backend/models/ChatMessageModel.js
// Chat message model for PowerLine messaging
import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "love", "fire"], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    media: [{ type: String }], // URLs or media IDs
    reactions: [reactionSchema], // 👍 like, ❤️ love, 🔥 fire
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes for efficient querying
chatMessageSchema.index({ chat: 1, createdAt: -1 });
chatMessageSchema.index({ author: 1 });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;

