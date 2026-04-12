// backend/models/Movie.js
import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  genre: [String],
  duration: Number, // minutes
  releaseYear: Number,
  rating: { type: String, enum: ["G", "PG", "PG-13", "R", "NC-17"] },
  poster: String,
  backdrop: String,
  videoUrl: String,
  trailerUrl: String,
  cast: [{ name: String, role: String, image: String }],
  director: String,
  studio: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "pending", "archived"], default: "active" },
}, { timestamps: true });

export default mongoose.model("Movie", movieSchema);










