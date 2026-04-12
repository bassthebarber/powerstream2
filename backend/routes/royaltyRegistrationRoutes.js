import mongoose from "mongoose";

const royaltySchema = new mongoose.Schema({
  name: String,
  amount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("RoyaltyRegistration", royaltySchema);