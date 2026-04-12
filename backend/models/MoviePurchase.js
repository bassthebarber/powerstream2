// backend/models/MoviePurchase.js
import mongoose from "mongoose";

const moviePurchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  purchaseType: { type: String, enum: ["rent", "buy"], required: true },
  price: { type: Number, required: true },
  expiresAt: Date, // For rentals
  transactionId: String,
  status: { type: String, enum: ["completed", "pending", "refunded"], default: "completed" },
}, { timestamps: true });

export default mongoose.model("MoviePurchase", moviePurchaseSchema);










