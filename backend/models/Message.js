// backend/models/Message.js
// @deprecated — PowerLine uses Supabase line_messages only.
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: String,
  media: [{
    type: { type: String, enum: ["image", "video", "audio", "file"] },
    url: String,
    name: String,
  }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isDeleted: { type: Boolean, default: false },
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emoji: String,
  }],
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);










