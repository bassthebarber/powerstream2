// backend/controllers/monetizationController.js
// Monetization Controller - Plans and Entitlements

import MonetizationPlan from "../models/MonetizationPlan.js";
import { getUserEntitlements } from "../services/monetization/entitlementsService.js";

/**
 * GET /api/monetization/plans
 * List all active monetization plans
 */
export async function listPlans(req, res) {
  try {
    const { type, stationId } = req.query;
    
    const query = { active: true };
    if (type) query.type = type;
    if (stationId) query.stationId = stationId;

    const plans = await MonetizationPlan.find(query)
      .sort({ sortOrder: 1, priceCents: 1 })
      .lean();

    // Add formatted prices
    const plansWithPrices = plans.map((plan) => ({
      ...plan,
      priceFormatted: `$${(plan.priceCents / 100).toFixed(2)}`,
    }));

    res.json({
      ok: true,
      plans: plansWithPrices,
      count: plansWithPrices.length,
    });
  } catch (error) {
    console.error("Error listing plans:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to list plans",
      message: error.message,
    });
  }
}

/**
 * GET /api/monetization/plans/:id
 * Get a specific plan
 */
export async function getPlan(req, res) {
  try {
    const { id } = req.params;
    
    const plan = await MonetizationPlan.findById(id).lean();
    
    if (!plan) {
      return res.status(404).json({
        ok: false,
        error: "Plan not found",
      });
    }

    res.json({
      ok: true,
      plan: {
        ...plan,
        priceFormatted: `$${(plan.priceCents / 100).toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error("Error getting plan:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to get plan",
      message: error.message,
    });
  }
}

/**
 * POST /api/monetization/plans (Admin only)
 * Create a new monetization plan
 */
export async function createPlan(req, res) {
  try {
    const {
      name,
      description,
      type,
      priceCents,
      currency,
      interval,
      intervalCount,
      stationId,
      contentType,
      contentId,
      features,
      sortOrder,
    } = req.body;

    if (!name || !type || priceCents === undefined) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: name, type, priceCents",
      });
    }

    const plan = new MonetizationPlan({
      name,
      description,
      type,
      priceCents,
      currency: currency || "usd",
      interval,
      intervalCount,
      stationId,
      contentType,
      contentId,
      features: features || [],
      sortOrder: sortOrder || 0,
      active: true,
    });

    await plan.save();

    res.status(201).json({
      ok: true,
      plan,
      message: "Plan created successfully",
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to create plan",
      message: error.message,
    });
  }
}

/**
 * PUT /api/monetization/plans/:id (Admin only)
 * Update a monetization plan
 */
export async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;

    const plan = await MonetizationPlan.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        ok: false,
        error: "Plan not found",
      });
    }

    res.json({
      ok: true,
      plan,
      message: "Plan updated successfully",
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to update plan",
      message: error.message,
    });
  }
}

/**
 * DELETE /api/monetization/plans/:id (Admin only)
 * Deactivate a plan (soft delete)
 */
export async function deletePlan(req, res) {
  try {
    const { id } = req.params;

    const plan = await MonetizationPlan.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        ok: false,
        error: "Plan not found",
      });
    }

    res.json({
      ok: true,
      message: "Plan deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to delete plan",
      message: error.message,
    });
  }
}

/**
 * GET /api/monetization/me/entitlements
 * Get current user's entitlements
 */
export async function getMyEntitlements(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    const entitlements = await getUserEntitlements(userId);

    res.json({
      ok: true,
      entitlements,
      count: entitlements.length,
    });
  } catch (error) {
    console.error("Error getting entitlements:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to get entitlements",
      message: error.message,
    });
  }
}

export default {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getMyEntitlements,
};










