// backend/controllers/ppvController.js
// PPV checkout + purchase history — Supabase payments only (no Mongo Purchase).

import {
  createCheckoutSessionPPV,
  isStripeConfigured,
} from "../services/payments/stripeService.js";
import { getSupabaseAdmin } from "../src/services/supabaseAdmin.js";
import { userHasEntitlement } from "../services/monetization/entitlementsService.js";

/**
 * POST /api/ppv/checkout
 * Start a PPV checkout
 */
export async function startPPVCheckout(req, res) {
  try {
    const { 
      contentType, 
      contentId, 
      contentTitle,
      amountCents, 
      currency,
      successUrl, 
      cancelUrl 
    } = req.body;
    const userId = req.user?.id || req.user?._id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    if (!contentType || !contentId || !amountCents) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: contentType, contentId, amountCents",
      });
    }

    if (!isStripeConfigured()) {
      return res.status(503).json({
        ok: false,
        error: "Payment processing is not configured",
      });
    }

    // Check if user already has access
    const hasAccess = await userHasEntitlement(userId, contentType, contentId);
    if (hasAccess) {
      return res.status(400).json({
        ok: false,
        error: "You already have access to this content",
      });
    }

    const session = await createCheckoutSessionPPV({
      userId,
      userEmail,
      contentType,
      contentId,
      contentTitle: contentTitle || `${contentType} Purchase`,
      amountCents,
      currency: currency || "usd",
      successUrl,
      cancelUrl,
    });

    res.json({
      ok: true,
      sessionId: session.sessionId,
      url: session.url,
      amount: `$${(amountCents / 100).toFixed(2)}`,
    });
  } catch (error) {
    console.error("Error starting PPV checkout:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to start checkout",
      message: error.message,
    });
  }
}

/**
 * GET /api/ppv/access
 * Check if user has access to PPV content
 */
export async function verifyPPVAccess(req, res) {
  try {
    const { contentType, contentId } = req.query;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    if (!contentType || !contentId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required query params: contentType, contentId",
      });
    }

    const hasAccess = await userHasEntitlement(userId, contentType, contentId);

    res.json({
      ok: true,
      hasAccess,
      contentType,
      contentId,
    });
  } catch (error) {
    console.error("Error verifying PPV access:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to verify access",
      message: error.message,
    });
  }
}

/**
 * GET /api/ppv/purchases — Supabase payments (ppv, video_purchase), completed only.
 */
export async function getMyPurchases(req, res) {
  try {
    const userId = String(req.user?.id || req.user?._id || "");
    const { contentType, limit = 50, page = 1 } = req.query;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    const sb = getSupabaseAdmin();
    if (!sb) {
      return res.status(503).json({
        ok: false,
        error: "Supabase required for purchase history",
        code: "SUPABASE_REQUIRED",
      });
    }

    const lim = Math.min(parseInt(limit, 10) || 50, 100);
    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const from = (pg - 1) * lim;
    const to = from + lim - 1;

    const base = () =>
      sb
        .from("payments")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("status", "completed")
        .in("type", ["ppv", "video_purchase"])
        .order("created_at", { ascending: false });

    let rows;
    let count;
    if (contentType) {
      const { data, error } = await base().limit(500);
      if (error) throw error;
      const ct = String(contentType);
      const filtered = (data || []).filter((r) => {
        const m = r.metadata || {};
        if (String(m.contentType || "") === ct) return true;
        if (ct === "film" && m.filmId) return true;
        return false;
      });
      count = filtered.length;
      rows = filtered.slice(from, from + lim);
    } else {
      const { data, error, count: c } = await base().range(from, to);
      if (error) throw error;
      rows = data || [];
      count = c ?? rows.length;
    }

    const purchases = rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      contentType: r.metadata?.contentType || "film",
      contentId: r.metadata?.contentId || r.metadata?.filmId,
      amountCents: r.amount_cents,
      currency: r.currency,
      status: r.status,
      createdAt: r.created_at,
      stripeSessionId: r.stripe_checkout_session_id,
    }));

    res.json({
      ok: true,
      purchases,
      pagination: {
        total: count ?? purchases.length,
        page: pg,
        limit: lim,
        pages: Math.ceil((count || 0) / lim) || 1,
      },
    });
  } catch (error) {
    console.error("Error getting purchases:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to get purchases",
      message: error.message,
    });
  }
}

/** GET /api/ppv/purchase/:id — Supabase payment row by UUID */
export async function getPurchase(req, res) {
  try {
    const { id } = req.params;
    const userId = String(req.user?.id || req.user?._id || "");

    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required",
      });
    }

    const sb = getSupabaseAdmin();
    if (!sb) {
      return res.status(503).json({ ok: false, error: "Supabase required" });
    }

    const { data, error } = await sb
      .from("payments")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({
        ok: false,
        error: "Purchase not found",
      });
    }

    const purchase = {
      id: data.id,
      userId: data.user_id,
      contentType: data.metadata?.contentType || "film",
      contentId: data.metadata?.contentId || data.metadata?.filmId,
      amountCents: data.amount_cents,
      currency: data.currency,
      status: data.status,
      createdAt: data.created_at,
    };

    res.json({
      ok: true,
      purchase,
    });
  } catch (error) {
    console.error("Error getting purchase:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to get purchase",
      message: error.message,
    });
  }
}

export default {
  startPPVCheckout,
  verifyPPVAccess,
  getMyPurchases,
  getPurchase,
};










