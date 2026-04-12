import mongoose from "mongoose";

const sampleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: String, // drum, vox, etc.
    tags: [String],
    filePath: String,
  },
  { timestamps: true }
);

export default mongoose.model("Sample", sampleSchema);
