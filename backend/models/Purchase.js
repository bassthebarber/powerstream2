// backend/models/Purchase.js
// @deprecated — payment history: Supabase `payments`. Do not write new PPV rows here.
// Purchase Model - legacy one-time purchases (PPV, films, events)
import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["film", "event", "station_ppv", "episode", "bundle"],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    contentTitle: {
      type: String,
      default: "",
    },
    amountCents: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "usd",
      lowercase: true,
    },
    provider: {
      type: String,
      enum: ["stripe", "paypal", "apple", "google", "coins", "manual"],
      required: true,
    },
    providerPaymentId: {
      type: String,
      default: null,
    },
    providerSessionId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "disputed"],
      default: "pending",
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundAmountCents: {
      type: Number,
      default: 0,
    },
    accessExpiresAt: {
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
PurchaseSchema.index({ userId: 1, status: 1 });
PurchaseSchema.index({ contentType: 1, contentId: 1 });
PurchaseSchema.index({ providerPaymentId: 1 });
PurchaseSchema.index({ providerSessionId: 1 });

// Virtual: Price formatted
PurchaseSchema.virtual("priceFormatted").get(function () {
  return `$${(this.amountCents / 100).toFixed(2)}`;
});

// Static: Check if user has purchased content
PurchaseSchema.statics.userHasPurchased = async function (userId, contentType, contentId) {
  const purchase = await this.findOne({
    userId,
    contentType,
    contentId,
    status: "completed",
    $or: [
      { accessExpiresAt: null },
      { accessExpiresAt: { $gt: new Date() } },
    ],
  });
  return !!purchase;
};

// Static: Get user's purchases
PurchaseSchema.statics.getUserPurchases = function (userId, options = {}) {
  const query = { userId, status: "completed" };
  if (options.contentType) query.contentType = options.contentType;
  return this.find(query).sort({ createdAt: -1 });
};

// Static: Find by session ID
PurchaseSchema.statics.findBySessionId = function (providerSessionId) {
  return this.findOne({ providerSessionId });
};

const Purchase = mongoose.model("Purchase", PurchaseSchema);

export default Purchase;










