import mongoose from "mongoose";

const mixJobSchema = new mongoose.Schema(
  {
    artistName: String,
    trackTitle: String,
    status: {
      type: String,
      enum: ["queued", "in_progress", "done", "rejected"],
      default: "queued",
    },
    notes: String,
    referenceUrl: String,
    renderPath: String,
  },
  { timestamps: true }
);

export default mongoose.model("MixJob", mixJobSchema);
