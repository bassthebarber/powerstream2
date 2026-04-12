// backend/models/Broadcast.js
import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
  title: { type: String, required: true },
  streamUrl: String,
  status: { type: String, enum: ["scheduled", "live", "ended"], default: "scheduled" },
  scheduledStart: Date,
  actualStart: Date,
  actualEnd: Date,
  viewers: { type: Number, default: 0 },
  peakViewers: { type: Number, default: 0 },
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Broadcast", broadcastSchema);










