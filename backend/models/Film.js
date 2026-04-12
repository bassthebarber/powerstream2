import mongoose from "mongoose";

const filmSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    genre: [String],
    category: String,
    tags: [String],
    duration: Number,
    releaseYear: Number,
    rating: String,
    poster: String,
    posterUrl: String,
    thumbnailUrl: String,
    backdrop: String,
    videoUrl: String,
    filmUrl: String,
    trailerUrl: String,
    cast: [{ name: String, role: String }],
    director: String,
    creatorName: String,
    stationSlug: { type: String, index: true },
    priceCents: { type: Number, default: 0 },
    requiresSubscription: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "pending", "archived"], default: "active" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    station: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
    monetization: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.Film || mongoose.model("Film", filmSchema);
