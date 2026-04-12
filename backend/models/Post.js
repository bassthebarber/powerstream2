// backend/models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, maxlength: 5000 },
  media: [{
    type: { type: String, enum: ["image", "video", "audio"] },
    url: String,
    thumbnail: String,
  }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  shares: { type: Number, default: 0 },
  visibility: { type: String, enum: ["public", "friends", "private"], default: "public" },
  tags: [String],
  location: String,
}, { timestamps: true });

export default mongoose.model("Post", postSchema);










