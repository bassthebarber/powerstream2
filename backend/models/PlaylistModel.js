// backend/models/PlaylistModel.js
// 24/7 station broadcast playlist — one document per station (stationId unique).
import mongoose from "mongoose";

const playlistVideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    title: { type: String, default: "Untitled" },
    thumbnail: { type: String, default: "" },
    durationSeconds: { type: Number, default: 600 },
    videoId: { type: String, default: "" },
  },
  { _id: true }
);

/** Optional MTV-style time slots (local server TZ unless client sends timezone later). */
const scheduleSlotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    slotTitle: { type: String, default: "" },
    videoIndex: { type: Number, default: 0 },
    url: { type: String, default: "" },
  },
  { _id: true }
);

const playlistSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
      unique: true,
      index: true,
    },
    title: { type: String, default: "Channel 24/7" },
    videos: { type: [playlistVideoSchema], default: [] },
    loop: { type: Boolean, default: true },
    schedule: { type: [scheduleSlotSchema], default: [] },
  },
  { timestamps: true }
);

const NAME = "StationBroadcastPlaylist";
export default mongoose.models[NAME] || mongoose.model(NAME, playlistSchema);
