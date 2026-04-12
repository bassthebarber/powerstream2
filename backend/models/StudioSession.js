// backend/models/StudioSession.js
import mongoose from "mongoose";

const studioSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recordings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recording" }],
  beats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Beat" }],
  mixdowns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mixdown" }],
  status: { type: String, enum: ["active", "completed", "archived"], default: "active" },
  notes: String,
  bpm: Number,
  key: String,
  genre: String,
}, { timestamps: true });

export default mongoose.model("StudioSession", studioSessionSchema);










