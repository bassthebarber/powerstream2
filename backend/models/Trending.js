// backend/models/Trending.js
import mongoose from "mongoose";

const trendingSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  hashtag: String,
  mentions: { type: Number, default: 0 },
  category: String,
  rank: { type: Number, default: 0 },
  region: String,
  relatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  isActive: { type: Boolean, default: true },
  peakAt: Date,
}, { timestamps: true });

export default mongoose.model("Trending", trendingSchema);










