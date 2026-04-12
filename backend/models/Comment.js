// backend/models/Comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 2000 },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  reel: { type: mongoose.Schema.Types.ObjectId, ref: "Reel" },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
}, { timestamps: true });

export default mongoose.model("Comment", commentSchema);










