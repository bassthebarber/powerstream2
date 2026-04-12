// backend/routes/stripeWebhookRoutes.js
// Stripe Webhook Routes - Handle payment events
import express from "express";
import { handleStripeWebhook } from "../controllers/stripeWebhookController.js";

const router = express.Router();

// ==========================================
// HEALTH CHECK
// ==========================================

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "stripe-webhooks",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// STRIPE WEBHOOK ENDPOINT
// NOTE: This route uses raw body parsing for signature verification
// ==========================================

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhooks
 * 
 * IMPORTANT: This endpoint requires raw body for signature verification.
 * The raw body middleware is applied in server.js BEFORE json middleware.
 */
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;










