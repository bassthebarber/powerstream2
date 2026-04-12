import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    name: String,
    type: String, // mic, interface, monitor, etc.
    serialNumber: String,
    location: String,
    status: { type: String, default: "online" },
  },
  { timestamps: true }
);

export default mongoose.model("Device", deviceSchema);
