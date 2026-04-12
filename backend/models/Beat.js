// backend/models/Beat.js
import mongoose from "mongoose";

const beatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  producer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  audioUrl: { type: String, required: true },
  previewUrl: String,
  thumbnail: String,
  duration: Number,
  bpm: { type: Number, required: true },
  key: String,
  genre: String,
  mood: [String],
  tags: [String],
  price: { type: Number, default: 0 },
  isExclusive: { type: Boolean, default: false },
  downloads: { type: Number, default: 0 },
  plays: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "sold", "archived"], default: "active" },
}, { timestamps: true });

export default mongoose.model("Beat", beatSchema);










