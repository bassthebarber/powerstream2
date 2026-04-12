// backend/controllers/adsController.js
// Ads Controller - Ad serving and tracking

import { 
  pickAd, 
  recordImpression, 
  recordClick,
  recordComplete,
  recordSkip,
  getCampaignStats,
  getActiveCampaigns,
  createCampaign,
} from "../services/ads/adDecisionService.js";

/**
 * GET /api/ads/decision
 * Get an ad decision based on targeting
 */
export async function getAdDecision(req, res) {
  try {
    const { stationId, tags, adType = "preroll" } = req.query;
    const userId = req.user?.id || req.user?._id || null;

    // Parse tags if string
    const tagList = tags 
      ? (typeof tags === "string" ? tags.split(",").map(t => t.trim()) : tags)
      : [];

    const ad = await pickAd({
      stationId,
      tags: tagList,
      adType,
      userId,
      deviceType: req.headers["x-device-type"] || "unknown",
    });

    if (!ad) {
      return res.json({
        ok: true,
        ad: null,
        message: "No ads available",
      });
    }

    res.json({
      ok: true,
      ad,
    });
  } catch (error) {
    console.error("Error getting ad decision:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to get ad",
      message: error.message,
    });
  }
}

/**
 * POST /api/ads/impression
 * Track an ad impression
 */
export async function trackImpression(req, res) {
  try {
    const { 
      campaignId, 
      stationId, 
      contentType, 
      contentId,
      sessionId 
    } = req.body;
    const userId = req.user?.id || req.user?._id || null;

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required field: campaignId",
      });
    }

    const ip = req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const deviceType = req.headers["x-device-type"] || "unknown";

    await recordImpression({
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

    res.json({
      ok: true,
      message: "Impression recorded",
    });
  } catch (error) {
    console.error("Error tracking impression:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to record impression",
      message: error.message,
    });
  }
}

/**
 * POST /api/ads/click
 * Track an ad click
 */
export async function trackClick(req, res) {
  try {
    const { 
      campaignId, 
      stationId, 
      contentType, 
      contentId,
      sessionId 
    } = req.body;
    const userId = req.user?.id || req.user?._id || null;

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required field: campaignId",
      });
    }

    const ip = req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const deviceType = req.headers["x-device-type"] || "unknown";

    await recordClick({
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

    res.json({
      ok: true,
      message: "Click recorded",
    });
  } catch (error) {
    console.error("Error tracking click:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to record click",
      message: error.message,
    });
  }
}

/**
 * POST /api/ads/complete
 * Track ad completion
 */
export async function trackComplete(req, res) {
  try {
    const { 
      campaignId, 
      stationId, 
      contentType, 
      contentId,
      sessionId,
      duration 
    } = req.body;
    const userId = req.user?.id || req.user?._id || null;

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required field: campaignId",
      });
    }

    await recordComplete({
      campaignId,
      stationId,
      contentType,
      contentId,
      userId,
      sessionId,
      duration,
    });

    res.json({
      ok: true,
      message: "Completion recorded",
    });
  } catch (error) {
    console.error("Error tracking completion:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to record completion",
      message: error.message,
    });
  }
}

/**
 * POST /api/ads/skip
 * Track ad skip
 */
export async function trackSkip(req, res) {
  try {
    const { 
      campaignId, 
      stationId, 
      contentType, 
      contentId,
      sessionId,
      position 
    } = req.body;
    const userId = req.user?.id || req.user?._id || null;

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required field: campaignId",
      });
    }

    await recordSkip({
      campaignId,
      stationId,
      contentType,
      contentId,
      userId,
      sessionId,
      position,
    });

    res.json({
      ok: true,
      message: "Skip recorded",
    });
  } catch (error) {
    console.error("Error tracking skip:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to record skip",
      message: error.message,
    });
  }
}

/**
 * GET /api/ads/campaigns (Admin)
 * Get all active campaigns
 */
export async function getCampaigns(req, res) {
  try {
    const campaigns = await getActiveCampaigns();

    res.json({
      ok: true,
      campaigns,
      count: campaigns.length,
    });
  } catch (error) {
    console.error("Error getting campaigns:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to get campaigns",
      message: error.message,
    });
  }
}

/**
 * GET /api/ads/campaigns/:id/stats (Admin)
 * Get campaign statistics
 */
export async function getCampaignStatsHandler(req, res) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const stats = await getCampaignStats(
      id,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({
      ok: true,
      campaignId: id,
      stats,
    });
  } catch (error) {
    console.error("Error getting campaign stats:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to get campaign stats",
      message: error.message,
    });
  }
}

/**
 * POST /api/ads/campaigns (Admin)
 * Create a new ad campaign
 */
export async function createCampaignHandler(req, res) {
  try {
    const campaignData = req.body;

    if (!campaignData.advertiserName || !campaignData.title || !campaignData.mediaUrl) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: advertiserName, title, mediaUrl",
      });
    }

    if (!campaignData.startAt || !campaignData.endAt) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: startAt, endAt",
      });
    }

    const campaign = await createCampaign(campaignData);

    res.status(201).json({
      ok: true,
      campaign,
      message: "Campaign created successfully",
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to create campaign",
      message: error.message,
    });
  }
}

export default {
  getAdDecision,
  trackImpression,
  trackClick,
  trackComplete,
  trackSkip,
  getCampaigns,
  getCampaignStatsHandler,
  createCampaignHandler,
};










