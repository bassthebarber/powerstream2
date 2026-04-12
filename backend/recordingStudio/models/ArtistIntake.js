import mongoose from "mongoose";

const artistIntakeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    genre: String,
    notes: String,
    source: String, // how they heard about you
  },
  { timestamps: true }
);

export default mongoose.model("ArtistIntake", artistIntakeSchema);
