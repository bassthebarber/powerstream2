// backend/services/ads/adDecisionService.js
// Ad Decision Service - Select and serve ads based on targeting

import AdCampaign from "../../models/AdCampaign.js";
import AdEvent from "../../models/AdEvent.js";

/**
 * Pick an ad based on targeting criteria
 */
export async function pickAd({
  stationId = null,
  tags = [],
  adType = "preroll",
  userId = null,
  deviceType = "unknown",
}) {
  // Get eligible campaigns
  const eligibleCampaigns = await AdCampaign.getEligibleAds({
    stationId,
    tags,
    adType,
  });

  if (eligibleCampaigns.length === 0) {
    return null;
  }

  // Filter out campaigns that have exhausted budget or impressions
  const activeCampaigns = eligibleCampaigns.filter((campaign) => {
    // Check budget
    if (campaign.budgetCents && campaign.spentCents >= campaign.budgetCents) {
      return false;
    }
    // Check max impressions
    if (campaign.maxImpressions && campaign.impressions >= campaign.maxImpressions) {
      return false;
    }
    return true;
  });

  if (activeCampaigns.length === 0) {
    return null;
  }

  // Weighted random selection based on priority
  const totalPriority = activeCampaigns.reduce((sum, c) => sum + c.priority, 0);
  let random = Math.random() * totalPriority;

  for (const campaign of activeCampaigns) {
    random -= campaign.priority;
    if (random <= 0) {
      return {
        campaignId: campaign._id,
        advertiserName: campaign.advertiserName,
        title: campaign.title,
        mediaUrl: campaign.mediaUrl,
        mediaType: campaign.mediaType,
        clickUrl: campaign.clickUrl,
        duration: campaign.duration,
        adType: campaign.adType,
      };
    }
  }

  // Fallback to first campaign
  const fallback = activeCampaigns[0];
  return {
    campaignId: fallback._id,
    advertiserName: fallback.advertiserName,
    title: fallback.title,
    mediaUrl: fallback.mediaUrl,
    mediaType: fallback.mediaType,
    clickUrl: fallback.clickUrl,
    duration: fallback.duration,
    adType: fallback.adType,
  };
}

/**
 * Record an ad impression
 */
export async function recordImpression({
  campaignId,
  stationId = null,
  contentType = null,
  contentId = null,
  userId = null,
  sessionId = null,
  ip = null,
  userAgent = null,
  deviceType = "unknown",
}) {
  // Create event record
  const event = new AdEvent({
    type: "impression",
    campaignId,
    stationId,
    contentType,
    contentId,
    userId,
    sessionId,
    ip,
    userAgent,
    deviceType,
  });

  await event.save();

  // Update campaign stats
  const campaign = await AdCampaign.findById(campaignId);
  if (campaign) {
    await campaign.recordImpression();
  }

  return event;
}

/**
 * Record an ad click
 */
export async function recordClick({
  campaignId,
  stationId = null,
  contentType = null,
  contentId = null,
  userId = null,
  sessionId = null,
  ip = null,
  userAgent = null,
  deviceType = "unknown",
}) {
  // Create event record
  const event = new AdEvent({
    type: "click",
    campaignId,
    stationId,
    contentType,
    contentId,
    userId,
    sessionId,
    ip,
    userAgent,
    deviceType,
  });

  await event.save();

  // Update campaign stats
  const campaign = await AdCampaign.findById(campaignId);
  if (campaign) {
    await campaign.recordClick();
  }

  return event;
}

/**
 * Record ad completion
 */
export async function recordComplete({
  campaignId,
  stationId = null,
  contentType = null,
  contentId = null,
  userId = null,
  sessionId = null,
  duration = null,
}) {
  const event = new AdEvent({
    type: "complete",
    campaignId,
    stationId,
    contentType,
    contentId,
    userId,
    sessionId,
    duration,
  });

  return event.save();
}

/**
 * Record ad skip
 */
export async function recordSkip({
  campaignId,
  stationId = null,
  contentType = null,
  contentId = null,
  userId = null,
  sessionId = null,
  position = null,
}) {
  const event = new AdEvent({
    type: "skip",
    campaignId,
    stationId,
    contentType,
    contentId,
    userId,
    sessionId,
    position,
  });

  return event.save();
}

/**
 * Get campaign performance stats
 */
export async function getCampaignStats(campaignId, startDate = null, endDate = null) {
  return AdEvent.getCampaignStats(campaignId, startDate, endDate);
}

/**
 * Get all active campaigns
 */
export async function getActiveCampaigns() {
  const now = new Date();
  return AdCampaign.find({
    active: true,
    startAt: { $lte: now },
    endAt: { $gte: now },
  }).sort({ priority: -1 });
}

/**
 * Create a new ad campaign
 */
export async function createCampaign(campaignData) {
  const campaign = new AdCampaign(campaignData);
  return campaign.save();
}

/**
 * Update ad campaign
 */
export async function updateCampaign(campaignId, updates) {
  return AdCampaign.findByIdAndUpdate(campaignId, updates, { new: true });
}

/**
 * Pause ad campaign
 */
export async function pauseCampaign(campaignId) {
  return AdCampaign.findByIdAndUpdate(campaignId, { active: false }, { new: true });
}

/**
 * Resume ad campaign
 */
export async function resumeCampaign(campaignId) {
  return AdCampaign.findByIdAndUpdate(campaignId, { active: true }, { new: true });
}

export default {
  pickAd,
  recordImpression,
  recordClick,
  recordComplete,
  recordSkip,
  getCampaignStats,
  getActiveCampaigns,
  createCampaign,
  updateCampaign,
  pauseCampaign,
  resumeCampaign,
};










