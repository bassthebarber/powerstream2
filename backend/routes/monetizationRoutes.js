// backend/routes/monetizationRoutes.js
// Monetization Routes - Plans and Entitlements
import express from "express";
import {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getMyEntitlements,
} from "../controllers/monetizationController.js";
import { requireAuth, authOptional } from "../middleware/requireAuth.js";

const router = express.Router();

// ==========================================
// HEALTH CHECK
// ==========================================

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "monetization",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * GET /api/monetization/plans
 * List all active monetization plans
 */
router.get("/plans", listPlans);

/**
 * GET /api/monetization/plans/:id
 * Get a specific plan
 */
router.get("/plans/:id", getPlan);

// ==========================================
// AUTHENTICATED ROUTES
// ==========================================

/**
 * GET /api/monetization/me/entitlements
 * Get current user's entitlements
 */
router.get("/me/entitlements", requireAuth, getMyEntitlements);

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * POST /api/monetization/plans
 * Create a new monetization plan (Admin)
 */
router.post("/plans", requireAuth, createPlan);

/**
 * PUT /api/monetization/plans/:id
 * Update a monetization plan (Admin)
 */
router.put("/plans/:id", requireAuth, updatePlan);

/**
 * DELETE /api/monetization/plans/:id
 * Deactivate a plan (Admin)
 */
router.delete("/plans/:id", requireAuth, deletePlan);

export default router;










