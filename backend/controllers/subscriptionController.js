// backend/controllers/subscriptionController.js
// Subscription Controller - Checkout and management

import Subscription from "../models/Subscription.js";
import MonetizationPlan from "../models/MonetizationPlan.js";
import { 
  createCheckoutSessionSubscription, 
  cancelSubscription as stripeCancelSubscription,
  isStripeConfigured 
} from "../services/payments/stripeService.js";

/**
 * POST /api/subscriptions/checkout/station/:stationId
 * Start a subscription checkout for a specific station
 */
export async function startStationSubscriptionCheckout(req, res) {
  try {
    const { stationId } = req.params;
    const { planId, successUrl, cancelUrl } = req.body;
    const userId = req.user?.id || req.user?._id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    if (!isStripeConfigured()) {
      return res.status(503).json({
        ok: false,
        error: "Payment processing is not configured",
      });
    }

    // Find the plan
    let plan;
    if (planId) {
      plan = await MonetizationPlan.findById(planId);
    } else {
      // Find default station subscription plan
      plan = await MonetizationPlan.findOne({
        stationId,
        type: "subscription",
        active: true,
      });
    }

    if (!plan) {
      return res.status(404).json({
        ok: false,
        error: "No subscription plan found for this station",
      });
    }

    // Create Stripe checkout session
    const session = await createCheckoutSessionSubscription({
      userId,
      userEmail,
      plan,
      stationId,
      successUrl,
      cancelUrl,
    });

    res.json({
      ok: true,
      sessionId: session.sessionId,
      url: session.url,
      plan: {
        id: plan._id,
        name: plan.name,
        priceFormatted: `$${(plan.priceCents / 100).toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error("Error starting station subscription checkout:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to start checkout",
      message: error.message,
    });
  }
}

/**
 * POST /api/subscriptions/checkout/global
 * Start a global subscription checkout
 */
export async function startGlobalSubscriptionCheckout(req, res) {
  try {
    const { planId, successUrl, cancelUrl } = req.body;
    const userId = req.user?.id || req.user?._id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    if (!isStripeConfigured()) {
      return res.status(503).json({
        ok: false,
        error: "Payment processing is not configured",
      });
    }

    // Find the plan
    let plan;
    if (planId) {
      plan = await MonetizationPlan.findById(planId);
    } else {
      // Find default global subscription plan
      plan = await MonetizationPlan.findOne({
        type: "global",
        active: true,
      });
    }

    if (!plan) {
      return res.status(404).json({
        ok: false,
        error: "No global subscription plan found",
      });
    }

    // Create Stripe checkout session
    const session = await createCheckoutSessionSubscription({
      userId,
      userEmail,
      plan,
      stationId: null,
      successUrl,
      cancelUrl,
    });

    res.json({
      ok: true,
      sessionId: session.sessionId,
      url: session.url,
      plan: {
        id: plan._id,
        name: plan.name,
        priceFormatted: `$${(plan.priceCents / 100).toFixed(2)}`,
      },
    });
  } catch (error) {
    console.error("Error starting global subscription checkout:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to start checkout",
      message: error.message,
    });
  }
}

/**
 * POST /api/subscriptions/cancel
 * Cancel a subscription
 */
export async function cancelSubscription(req, res) {
  try {
    const { subscriptionId, atPeriodEnd = true } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    // Find the subscription
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
    });

    if (!subscription) {
      return res.status(404).json({
        ok: false,
        error: "Subscription not found",
      });
    }

    // Cancel with Stripe if applicable
    if (subscription.provider === "stripe" && subscription.providerSubscriptionId) {
      await stripeCancelSubscription(subscription.providerSubscriptionId, atPeriodEnd);
    }

    // Update local subscription
    await subscription.cancel(atPeriodEnd);

    res.json({
      ok: true,
      message: atPeriodEnd 
        ? "Subscription will be canceled at the end of the billing period" 
        : "Subscription canceled immediately",
      subscription: {
        id: subscription._id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to cancel subscription",
      message: error.message,
    });
  }
}

/**
 * GET /api/subscriptions/me
 * Get current user's subscriptions
 */
export async function getMySubscriptions(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    const subscriptions = await Subscription.find({ userId })
      .populate("planId")
      .populate("stationId", "name key logoUrl")
      .sort({ createdAt: -1 });

    res.json({
      ok: true,
      subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    console.error("Error getting subscriptions:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to get subscriptions",
      message: error.message,
    });
  }
}

/**
 * GET /api/subscriptions/:id
 * Get a specific subscription
 */
export async function getSubscription(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    const subscription = await Subscription.findOne({ _id: id, userId })
      .populate("planId")
      .populate("stationId", "name key logoUrl");

    if (!subscription) {
      return res.status(404).json({
        ok: false,
        error: "Subscription not found",
      });
    }

    res.json({
      ok: true,
      subscription,
    });
  } catch (error) {
    console.error("Error getting subscription:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to get subscription",
      message: error.message,
    });
  }
}

export default {
  startStationSubscriptionCheckout,
  startGlobalSubscriptionCheckout,
  cancelSubscription,
  getMySubscriptions,
  getSubscription,
};










