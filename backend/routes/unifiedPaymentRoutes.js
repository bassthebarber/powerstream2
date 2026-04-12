import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  createCheckoutSession,
  computeRevenueSplit,
} from "../services/monetization/unifiedPaymentService.js";

const router = Router();

/**
 * POST /api/payments/unified/checkout
 * Body: { action: 'tip'|'video_purchase'|'station_subscription', amountCents?, creatorId?, stationSlug?, filmId?, filmTitle? }
 */
router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const {
      action,
      amountCents,
      creatorId,
      stationSlug,
      filmId,
      filmTitle,
      successUrl,
      cancelUrl,
    } = req.body || {};

    if (!action) {
      return res.status(400).json({ ok: false, error: "action required" });
    }

    const user = req.user;
    const { url, sessionId } = await createCheckoutSession({
      userId: user._id,
      userEmail: user.email,
      action,
      amountCents,
      creatorId,
      stationSlug,
      filmId,
      filmTitle,
      successUrl,
      cancelUrl,
    });

    return res.json({
      ok: true,
      url,
      sessionId,
      split: computeRevenueSplit(
        amountCents ||
          (action === "tip" ? 500 : action === "video_purchase" ? 299 : 999)
      ),
    });
  } catch (e) {
    console.error("[unifiedPaymentRoutes]", e.message);
    return res.status(500).json({ ok: false, error: e.message || "Checkout failed" });
  }
});

router.get("/split-preview", (req, res) => {
  const cents = parseInt(req.query.cents, 10) || 1000;
  res.json({ ok: true, ...computeRevenueSplit(cents) });
});

export default router;
