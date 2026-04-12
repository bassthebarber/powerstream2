// backend/routes/subscriptionRoutes.js
// Subscription Routes - Checkout and management
import express from "express";
import {
  startStationSubscriptionCheckout,
  startGlobalSubscriptionCheckout,
  cancelSubscription,
  getMySubscriptions,
  getSubscription,
} from "../controllers/subscriptionController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// ==========================================
// HEALTH CHECK
// ==========================================

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "subscriptions",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// ALL ROUTES REQUIRE AUTH
// ==========================================

router.use(requireAuth);

// ==========================================
// CHECKOUT ROUTES
// ==========================================

/**
 * POST /api/subscriptions/checkout/station/:stationId
 * Start a subscription checkout for a specific station
 */
router.post("/checkout/station/:stationId", startStationSubscriptionCheckout);

/**
 * POST /api/subscriptions/checkout/global
 * Start a global subscription checkout
 */
router.post("/checkout/global", startGlobalSubscriptionCheckout);

// ==========================================
// SUBSCRIPTION MANAGEMENT
// ==========================================

/**
 * GET /api/subscriptions/me
 * Get current user's subscriptions
 */
router.get("/me", getMySubscriptions);

/**
 * GET /api/subscriptions/:id
 * Get a specific subscription
 */
router.get("/:id", getSubscription);

/**
 * POST /api/subscriptions/cancel
 * Cancel a subscription
 */
router.post("/cancel", cancelSubscription);

export default router;
