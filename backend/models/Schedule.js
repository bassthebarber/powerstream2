// backend/models/Schedule.js
import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: "Film" },
  title: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isLive: { type: Boolean, default: false },
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: String,
}, { timestamps: true });

export default mongoose.model("Schedule", scheduleSchema);










