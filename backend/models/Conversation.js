// backend/models/Conversation.js
// @deprecated — PowerLine uses Supabase line_messages only.
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  type: { type: String, enum: ["dm", "group"], default: "dm" },
  name: String, // For group chats
  avatar: String, // For group chats
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  unreadCounts: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    count: { type: Number, default: 0 },
  }],
  isArchived: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);










