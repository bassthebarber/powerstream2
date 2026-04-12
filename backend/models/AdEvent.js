// backend/models/AdEvent.js
// Ad Event Model - Tracks ad impressions and clicks
import mongoose from "mongoose";

const AdEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["impression", "click", "complete", "skip", "error"],
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdCampaign",
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      default: null,
    },
    contentType: {
      type: String,
      enum: ["film", "event", "live", "vod", null],
      default: null,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    referrer: {
      type: String,
      default: null,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "tv", "unknown"],
      default: "unknown",
    },
    duration: {
      type: Number,
      default: null,
    },
    position: {
      type: Number,
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
AdEventSchema.index({ campaignId: 1, type: 1, createdAt: -1 });
AdEventSchema.index({ stationId: 1, createdAt: -1 });
AdEventSchema.index({ userId: 1, createdAt: -1 });
AdEventSchema.index({ createdAt: -1 });
AdEventSchema.index({ type: 1, createdAt: -1 });

// TTL index - auto delete after 90 days
AdEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Static: Get campaign stats
AdEventSchema.statics.getCampaignStats = async function (campaignId, startDate = null, endDate = null) {
  const match = { campaignId: new mongoose.Types.ObjectId(campaignId) };
  
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    impressions: 0,
    clicks: 0,
    completes: 0,
    skips: 0,
    errors: 0,
  };

  stats.forEach((s) => {
    if (s._id === "impression") result.impressions = s.count;
    if (s._id === "click") result.clicks = s.count;
    if (s._id === "complete") result.completes = s.count;
    if (s._id === "skip") result.skips = s.count;
    if (s._id === "error") result.errors = s.count;
  });

  result.ctr = result.impressions > 0 
    ? ((result.clicks / result.impressions) * 100).toFixed(2) 
    : 0;

  return result;
};

// Static: Get hourly stats
AdEventSchema.statics.getHourlyStats = async function (campaignId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        campaignId: new mongoose.Types.ObjectId(campaignId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          hour: { $hour: "$createdAt" },
          type: "$type",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1, "_id.hour": 1 } },
  ]);
};

const AdEvent = mongoose.model("AdEvent", AdEventSchema);

export default AdEvent;










