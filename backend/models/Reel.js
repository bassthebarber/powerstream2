// backend/models/Reel.js
import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoUrl: { type: String, required: true },
  thumbnail: String,
  caption: { type: String, maxlength: 500 },
  music: { name: String, artist: String, audioUrl: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  tags: [String],
  duration: Number, // seconds
  status: { type: String, enum: ["active", "pending", "removed"], default: "active" },
}, { timestamps: true });

export default mongoose.model("Reel", reelSchema);










