// backend/models/Station.js
import mongoose from "mongoose";

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  // Streaming system (HLS via NodeMediaServer)
  streamKey: { type: String, unique: true, index: true },
  type: { type: String, enum: ["tv", "radio", "stream", "artist"], default: "tv" },
  description: String,
  /** Display tags (e.g. Live, VOD, Upload) for listings and API consumers */
  tags: [{ type: String }],
  logo: String,
  banner: String,
  streamUrl: String,
  playbackUrl: String,
  schedule: [{ type: mongoose.Schema.Types.ObjectId, ref: "Schedule" }],
  isLive: { type: Boolean, default: false },
  category: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },
  /** Embedded VOD items (legacy / TV upload); broadcast playlist may sync from here. */
  videos: {
    type: [
      {
        title: String,
        description: String,
        url: String,
        videoUrl: String,
        thumbnail: String,
        thumbnailUrl: String,
        durationSeconds: Number,
        uploadedAt: Date,
      },
    ],
    default: undefined,
  },
  isPublic: { type: Boolean, default: true },
  logoUrl: String,
}, { timestamps: true });

export default mongoose.model("Station", stationSchema);










