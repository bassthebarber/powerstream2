// backend/models/AudioTrack.js
import mongoose from "mongoose";

const audioTrackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  audioUrl: { type: String, required: true },
  thumbnail: String,
  duration: Number,
  genre: String,
  album: String,
  year: Number,
  plays: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  station: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("AudioTrack", audioTrackSchema);










