// backend/models/MonetizationPlan.js
// Monetization Plan Model - Subscriptions, PPV, and Global Plans
import mongoose from "mongoose";

const MonetizationPlanSchema = new mongoose.Schema(
  {
    name: {
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
      enum: ["subscription", "ppv", "global"],
      required: true,
    },
    priceCents: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "usd",
      lowercase: true,
    },
    interval: {
      type: String,
      enum: ["month", "year", "one_time", null],
      default: null,
    },
    intervalCount: {
      type: Number,
      default: 1,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      default: null,
    },
    contentType: {
      type: String,
      enum: ["film", "event", "station", "channel", null],
      default: null,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    features: [{
      type: String,
    }],
    stripePriceId: {
      type: String,
      default: null,
    },
    stripeProductId: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MonetizationPlanSchema.index({ type: 1, active: 1 });
MonetizationPlanSchema.index({ stationId: 1 });
MonetizationPlanSchema.index({ contentType: 1, contentId: 1 });

// Virtual for price in dollars
MonetizationPlanSchema.virtual("priceFormatted").get(function () {
  return `$${(this.priceCents / 100).toFixed(2)}`;
});

// Static: Get active subscription plans
MonetizationPlanSchema.statics.getActiveSubscriptionPlans = function () {
  return this.find({ type: "subscription", active: true }).sort({ sortOrder: 1 });
};

// Static: Get station plans
MonetizationPlanSchema.statics.getStationPlans = function (stationId) {
  return this.find({ stationId, active: true }).sort({ sortOrder: 1 });
};

const MonetizationPlan = mongoose.model("MonetizationPlan", MonetizationPlanSchema);

export default MonetizationPlan;










