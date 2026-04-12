import mongoose from "mongoose";

const collabSessionSchema = new mongoose.Schema(
  {
    title: String,
    roomCode: { type: String, required: true },
    host: String,
    participants: [String],
    status: { type: String, default: "open" }, // open, active, closed
  },
  { timestamps: true }
);

export default mongoose.model("CollabSession", collabSessionSchema);
