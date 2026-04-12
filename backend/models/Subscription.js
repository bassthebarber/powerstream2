// backend/models/Subscription.js
// User Subscription Model - Tracks active subscriptions
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MonetizationPlan",
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "past_due", "canceled", "incomplete", "trialing", "paused"],
      default: "incomplete",
    },
    provider: {
      type: String,
      enum: ["stripe", "paypal", "apple", "google", "manual"],
      required: true,
    },
    providerCustomerId: {
      type: String,
      default: null,
    },
    providerSubscriptionId: {
      type: String,
      default: null,
    },
    providerPriceId: {
      type: String,
      default: null,
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    trialEnd: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ providerSubscriptionId: 1 });
SubscriptionSchema.index({ stationId: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });

// Virtual: Is subscription currently active
SubscriptionSchema.virtual("isActive").get(function () {
  if (this.status !== "active" && this.status !== "trialing") return false;
  if (!this.currentPeriodEnd) return false;
  return new Date() < this.currentPeriodEnd;
});

// Static: Get user's active subscriptions
SubscriptionSchema.statics.getUserActiveSubscriptions = function (userId) {
  return this.find({
    userId,
    status: { $in: ["active", "trialing"] },
    currentPeriodEnd: { $gt: new Date() },
  }).populate("planId");
};

// Static: Find by provider subscription ID
SubscriptionSchema.statics.findByProviderSubscriptionId = function (providerSubscriptionId) {
  return this.findOne({ providerSubscriptionId });
};

// Method: Cancel subscription
SubscriptionSchema.methods.cancel = async function (atPeriodEnd = true) {
  if (atPeriodEnd) {
    this.cancelAtPeriodEnd = true;
  } else {
    this.status = "canceled";
    this.canceledAt = new Date();
  }
  return this.save();
};

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

export default Subscription;
