// backend/models/MarketplaceListing.js
// Marketplace Listing Model - Distribution system for films, stations, events
import mongoose from "mongoose";

const MarketplaceListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["film", "station", "live", "event"],
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    accessType: {
      type: String,
      enum: ["free", "ppv", "subscription"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MarketplaceListingSchema.index({ status: 1, type: 1 });
MarketplaceListingSchema.index({ ownerId: 1 });
MarketplaceListingSchema.index({ createdAt: -1 });

const MarketplaceListing = mongoose.model("MarketplaceListing", MarketplaceListingSchema);

export default MarketplaceListing;










