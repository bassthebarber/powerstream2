// backend/routes/adsRoutes.js
// Ads Routes - Ad serving and tracking
import express from "express";
import {
  getAdDecision,
  trackImpression,
  trackClick,
  trackComplete,
  trackSkip,
  getCampaigns,
  getCampaignStatsHandler,
  createCampaignHandler,
} from "../controllers/adsController.js";
import { authOptional, requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// ==========================================
// HEALTH CHECK
// ==========================================

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ads",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// PUBLIC AD SERVING
// ==========================================

/**
 * GET /api/ads/decision
 * Get an ad decision based on targeting
 * Query: stationId?, tags?, adType?
 */
router.get("/decision", authOptional, getAdDecision);

// ==========================================
// TRACKING (minimal auth - just attach user if present)
// ==========================================

/**
 * POST /api/ads/impression
 * Track an ad impression
 * Body: { campaignId, stationId?, contentType?, contentId?, sessionId? }
 */
router.post("/impression", authOptional, trackImpression);

/**
 * POST /api/ads/click
 * Track an ad click
 * Body: { campaignId, stationId?, contentType?, contentId?, sessionId? }
 */
router.post("/click", authOptional, trackClick);

/**
 * POST /api/ads/complete
 * Track ad completion
 * Body: { campaignId, stationId?, contentType?, contentId?, sessionId?, duration? }
 */
router.post("/complete", authOptional, trackComplete);

/**
 * POST /api/ads/skip
 * Track ad skip
 * Body: { campaignId, stationId?, contentType?, contentId?, sessionId?, position? }
 */
router.post("/skip", authOptional, trackSkip);

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * GET /api/ads/campaigns
 * Get all active campaigns (Admin)
 */
router.get("/campaigns", requireAuth, getCampaigns);

/**
 * GET /api/ads/campaigns/:id/stats
 * Get campaign statistics (Admin)
 */
router.get("/campaigns/:id/stats", requireAuth, getCampaignStatsHandler);

/**
 * POST /api/ads/campaigns
 * Create a new ad campaign (Admin)
 */
router.post("/campaigns", requireAuth, createCampaignHandler);

export default router;










