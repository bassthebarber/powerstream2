// backend/routes/ppvRoutes.js
// PPV Routes - Pay-Per-View purchases
import express from "express";
import {
  startPPVCheckout,
  verifyPPVAccess,
  getMyPurchases,
  getPurchase,
} from "../controllers/ppvController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// ==========================================
// HEALTH CHECK
// ==========================================

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ppv",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// ALL ROUTES REQUIRE AUTH
// ==========================================

router.use(requireAuth);

// ==========================================
// CHECKOUT
// ==========================================

/**
 * POST /api/ppv/checkout
 * Start a PPV checkout
 * Body: { contentType, contentId, contentTitle, amountCents, currency?, successUrl?, cancelUrl? }
 */
router.post("/checkout", startPPVCheckout);

// ==========================================
// ACCESS VERIFICATION
// ==========================================

/**
 * GET /api/ppv/access
 * Check if user has access to PPV content
 * Query: contentType, contentId
 */
router.get("/access", verifyPPVAccess);

// ==========================================
// PURCHASE HISTORY
// ==========================================

/**
 * GET /api/ppv/purchases
 * Get user's PPV purchases
 */
router.get("/purchases", getMyPurchases);

/**
 * GET /api/ppv/purchase/:id
 * Get a specific purchase
 */
router.get("/purchase/:id", getPurchase);

export default router;










