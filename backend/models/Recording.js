// backend/models/Recording.js
import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  audioUrl: { type: String, required: true },
  waveformUrl: String,
  duration: Number,
  format: { type: String, default: "mp3" },
  size: Number,
  bpm: Number,
  key: String,
  genre: String,
  tags: [String],
  session: { type: mongoose.Schema.Types.ObjectId, ref: "StudioSession" },
  status: { type: String, enum: ["draft", "mastered", "published"], default: "draft" },
}, { timestamps: true });

export default mongoose.model("Recording", recordingSchema);










