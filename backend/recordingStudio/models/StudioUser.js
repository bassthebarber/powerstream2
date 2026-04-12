import mongoose from "mongoose";

const studioUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // plain for now (dev only)
    name: String,
    role: { type: String, default: "artist" }, // artist, admin, engineer
  },
  { timestamps: true }
);

export default mongoose.model("StudioUser", studioUserSchema);
