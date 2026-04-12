// backend/models/Mixdown.js
import mongoose from "mongoose";

const mixdownSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  audioUrl: { type: String, required: true },
  originalRecording: { type: mongoose.Schema.Types.ObjectId, ref: "Recording" },
  preset: String,
  settings: {
    eq: Object,
    compression: Object,
    reverb: Object,
    limiter: Object,
  },
  format: { type: String, default: "wav" },
  sampleRate: { type: Number, default: 44100 },
  bitDepth: { type: Number, default: 24 },
}, { timestamps: true });

export default mongoose.model("Mixdown", mixdownSchema);










