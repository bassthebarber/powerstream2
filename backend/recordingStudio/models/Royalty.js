import mongoose from "mongoose";

const royaltySchema = new mongoose.Schema(
  {
    trackTitle: { type: String, required: true },
    masterOwner: String,
    splits: [
      {
        name: String,
        percentage: Number, // 0 - 100
      },
    ],
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Royalty", royaltySchema);
