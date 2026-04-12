// backend/models/AdCampaign.js
// Ad Campaign Model - Internal ad inventory management
import mongoose from "mongoose";

const AdCampaignSchema = new mongoose.Schema(
  {
    advertiserName: {
      type: String,
      required: true,
      trim: true,
    },
    advertiserEmail: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    adType: {
      type: String,
      enum: ["preroll", "midroll", "banner", "overlay", "sponsored"],
      default: "preroll",
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["video", "image", "html"],
      default: "video",
    },
    clickUrl: {
      type: String,
      default: null,
    },
    duration: {
      type: Number,
      default: 15,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    targeting: {
      stationIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
      }],
      tags: [{
        type: String,
      }],
      geoLocations: [{
        type: String,
      }],
      ageRange: {
        min: { type: Number, default: null },
        max: { type: Number, default: null },
      },
    },
    budgetCents: {
      type: Number,
      default: null,
    },
    spentCents: {
      type: Number,
      default: 0,
    },
    cpmCents: {
      type: Number,
      default: 500,
    },
    cpcCents: {
      type: Number,
      default: null,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    maxImpressions: {
      type: Number,
      default: null,
    },
    maxClicks: {
      type: Number,
      default: null,
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    active: {
      type: Boolean,
      default: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AdCampaignSchema.index({ active: 1, startAt: 1, endAt: 1 });
AdCampaignSchema.index({ "targeting.stationIds": 1 });
AdCampaignSchema.index({ "targeting.tags": 1 });
AdCampaignSchema.index({ adType: 1 });
AdCampaignSchema.index({ priority: -1 });

// Virtual: CTR (Click Through Rate)
AdCampaignSchema.virtual("ctr").get(function () {
  if (this.impressions === 0) return 0;
  return ((this.clicks / this.impressions) * 100).toFixed(2);
});

// Virtual: Is campaign currently running
AdCampaignSchema.virtual("isRunning").get(function () {
  if (!this.active) return false;
  const now = new Date();
  if (now < this.startAt || now > this.endAt) return false;
  if (this.budgetCents && this.spentCents >= this.budgetCents) return false;
  if (this.maxImpressions && this.impressions >= this.maxImpressions) return false;
  return true;
});

// Static: Get eligible ads for targeting
AdCampaignSchema.statics.getEligibleAds = function (options = {}) {
  const now = new Date();
  const query = {
    active: true,
    startAt: { $lte: now },
    endAt: { $gte: now },
  };

  // Station targeting
  if (options.stationId) {
    query.$or = [
      { "targeting.stationIds": { $size: 0 } },
      { "targeting.stationIds": options.stationId },
    ];
  }

  // Tag targeting
  if (options.tags && options.tags.length > 0) {
    query.$or = query.$or || [];
    query.$or.push(
      { "targeting.tags": { $size: 0 } },
      { "targeting.tags": { $in: options.tags } }
    );
  }

  // Ad type
  if (options.adType) {
    query.adType = options.adType;
  }

  return this.find(query).sort({ priority: -1 });
};

// Method: Record impression
AdCampaignSchema.methods.recordImpression = async function () {
  this.impressions += 1;
  if (this.cpmCents) {
    this.spentCents += Math.floor(this.cpmCents / 1000);
  }
  return this.save();
};

// Method: Record click
AdCampaignSchema.methods.recordClick = async function () {
  this.clicks += 1;
  if (this.cpcCents) {
    this.spentCents += this.cpcCents;
  }
  return this.save();
};

const AdCampaign = mongoose.model("AdCampaign", AdCampaignSchema);

export default AdCampaign;










