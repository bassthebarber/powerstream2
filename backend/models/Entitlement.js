// backend/models/Entitlement.js
// Entitlement Model - User access rights to content
import mongoose from "mongoose";

const EntitlementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    entitlementType: {
      type: String,
      enum: ["subscription", "ppv", "free", "promo", "gift"],
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      default: null,
    },
    contentType: {
      type: String,
      enum: ["film", "event", "station", "channel", "all", null],
      default: null,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validTo: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: ["stripe", "paypal", "apple", "google", "coins", "admin", "promo"],
      required: true,
    },
    sourceId: {
      type: String,
      default: null,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EntitlementSchema.index({ userId: 1, active: 1, validTo: 1 });
EntitlementSchema.index({ userId: 1, contentType: 1, contentId: 1 });
EntitlementSchema.index({ userId: 1, stationId: 1 });
EntitlementSchema.index({ subscriptionId: 1 });
EntitlementSchema.index({ purchaseId: 1 });

// Virtual: Is currently valid
EntitlementSchema.virtual("isValid").get(function () {
  if (!this.active) return false;
  const now = new Date();
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validTo && now > this.validTo) return false;
  return true;
});

// Static: Check user entitlement for specific content
EntitlementSchema.statics.userHasEntitlement = async function (userId, contentType, contentId, stationId = null) {
  const now = new Date();
  
  // Build query conditions
  const conditions = [
    // Specific content entitlement
    {
      userId,
      active: true,
      $or: [{ validTo: null }, { validTo: { $gt: now } }],
      validFrom: { $lte: now },
      contentType,
      contentId,
    },
    // Global subscription entitlement
    {
      userId,
      active: true,
      $or: [{ validTo: null }, { validTo: { $gt: now } }],
      validFrom: { $lte: now },
      isGlobal: true,
    },
  ];

  // Station-level entitlement
  if (stationId) {
    conditions.push({
      userId,
      active: true,
      $or: [{ validTo: null }, { validTo: { $gt: now } }],
      validFrom: { $lte: now },
      stationId,
      contentType: { $in: [contentType, "all", null] },
    });
  }

  const entitlement = await this.findOne({ $or: conditions });
  return !!entitlement;
};

// Static: Get all user entitlements
EntitlementSchema.statics.getUserEntitlements = function (userId) {
  const now = new Date();
  return this.find({
    userId,
    active: true,
    $or: [{ validTo: null }, { validTo: { $gt: now } }],
    validFrom: { $lte: now },
  }).populate("subscriptionId purchaseId");
};

// Method: Revoke entitlement
EntitlementSchema.methods.revoke = async function (reason = "manual") {
  this.active = false;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

const Entitlement = mongoose.model("Entitlement", EntitlementSchema);

export default Entitlement;










