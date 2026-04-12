/**
 * PowerStream — ALL money movement is recorded here + Stripe Checkout creation.
 * Supabase `payments` is the single ledger. Uses splitService.calculateSplit only.
 */
import Stripe from "stripe";
import { getSupabaseAdmin } from "../../src/services/supabaseAdmin.js";
import { calculateSplit } from "./splitService.js";
import { getCoinPackages } from "./coinPackages.js";
import { grantPPVEntitlement, grantSubscriptionEntitlement } from "./entitlementsService.js";

export { calculateSplit };
export const PLATFORM_CUT = 0.3;
export const CREATOR_CUT = 0.7;

export function computeRevenueSplit(amountCents) {
  const s = calculateSplit(amountCents);
  return {
    amount_cents: s.amountCents,
    platform_fee_cents: s.platformFeeCents,
    creator_earnings_cents: s.creatorEarningsCents,
  };
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2023-10-16" });
}

async function sessionAlreadyRecorded(stripeSessionId) {
  if (!stripeSessionId) return false;
  const sb = getSupabaseAdmin();
  if (!sb) return false;
  const { data } = await sb
    .from("payments")
    .select("id")
    .eq("stripe_checkout_session_id", stripeSessionId)
    .maybeSingle();
  return !!data;
}

/**
 * Persist completed (or pending) payment — idempotent by stripeSessionId when provided.
 * Maps to ledger: userId, creatorId, amount, platformFee, creatorEarnings, paymentType, stripeSessionId, status
 */
export async function recordCompletedPayment({
  userId,
  creatorId = null,
  stationSlug = null,
  paymentType,
  amountCents,
  status = "completed",
  stripeSessionId = null,
  extraMetadata = {},
}) {
  const sb = getSupabaseAdmin();
  const split = calculateSplit(amountCents);
  if (!sb) {
    console.warn("[unifiedPayment] Supabase off — payment not persisted:", paymentType, amountCents);
    return { skipped: true };
  }

  if (stripeSessionId) {
    const dup = await sessionAlreadyRecorded(stripeSessionId);
    if (dup) return { duplicate: true };
  }

  const metadata = {
    userId: String(userId),
    creatorId: creatorId ? String(creatorId) : null,
    amount: split.amountCents,
    platformFee: split.platformFeeCents,
    creatorEarnings: split.creatorEarningsCents,
    paymentType,
    stripeSessionId,
    ...extraMetadata,
  };

  const row = {
    user_id: String(userId),
    creator_id: creatorId ? String(creatorId) : null,
    station_slug: stationSlug || null,
    type: paymentType,
    amount_cents: split.amountCents,
    platform_fee_cents: split.platformFeeCents,
    creator_earnings_cents: split.creatorEarningsCents,
    currency: "usd",
    status,
    stripe_checkout_session_id: stripeSessionId,
    metadata,
  };

  let { data, error } = await sb.from("payments").insert(row).select("id").single();
  if (error) {
    const fallback = {
      user_id: row.user_id,
      station_slug: row.station_slug,
      type: row.type,
      amount_cents: row.amount_cents,
      currency: row.currency,
      status: row.status,
      metadata: { ...metadata, platform_fee_cents: split.platformFeeCents, creator_earnings_cents: split.creatorEarningsCents },
    };
    ({ data, error } = await sb.from("payments").insert(fallback).select("id").single());
  }
  if (error) {
    console.error("[unifiedPayment] insert failed:", error.message);
    throw error;
  }
  return { id: data?.id, duplicate: false };
}

/** Live tips / live-engine ledger rows (no Stripe session). */
export async function recordLiveTipPayment({ userId, creatorId, stationSlug, amountCents }) {
  return recordCompletedPayment({
    userId,
    creatorId,
    stationSlug,
    paymentType: "live_tip",
    amountCents,
    stripeSessionId: null,
    extraMetadata: { source: "live_engine" },
  });
}

export async function recordLiveSubscriptionSignal({ userId, stationSlug, amountCents = 0 }) {
  return recordCompletedPayment({
    userId,
    creatorId: null,
    stationSlug,
    paymentType: "live_station_subscribe",
    amountCents,
    stripeSessionId: null,
    extraMetadata: { source: "live_engine" },
  });
}

const appUrl = () => process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:5173";

export async function createCheckoutSession({
  userId,
  userEmail,
  action,
  amountCents,
  creatorId,
  stationSlug,
  filmId,
  filmTitle,
  packageId,
  successUrl,
  cancelUrl,
}) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");

  const fe = (process.env.FRONTEND_URL || appUrl()).replace(/\/+$/, "");
  const success =
    successUrl || `${fe}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancel = cancelUrl || `${fe}/payment/cancel`;

  const meta = {
    unified: "1",
    userId: String(userId),
    creatorId: creatorId ? String(creatorId) : "",
    stationSlug: stationSlug || "",
    action,
  };

  if (action === "coin_purchase") {
    const packs = getCoinPackages();
    const pkg = packs.find((p) => p.id === packageId);
    if (!pkg) throw new Error("Invalid coin package");
    const cents = Math.round(pkg.price * 100);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: pkg.currency.toLowerCase(),
            unit_amount: cents,
            product_data: {
              name: `PowerStream ${pkg.label}`,
              description: `${pkg.coins} coins`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: success,
      cancel_url: cancel,
      metadata: {
        ...meta,
        type: "unified_coin",
        packageId: pkg.id,
        coins: String(pkg.coins),
        amountCents: String(cents),
      },
    });
    return { url: session.url, sessionId: session.id };
  }

  if (action === "tip") {
    const cents = Math.max(100, parseInt(amountCents, 10) || 500);
    meta.amountCents = String(cents);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: cents,
            product_data: {
              name: "Tip creator",
              description: stationSlug ? `Station: ${stationSlug}` : "PowerStream tip",
            },
          },
          quantity: 1,
        },
      ],
      success_url: success,
      cancel_url: cancel,
      metadata: { ...meta, type: "unified_tip", amountCents: String(cents) },
    });
    return { url: session.url, sessionId: session.id };
  }

  if (action === "video_purchase") {
    const cents = Math.max(50, parseInt(amountCents, 10) || 299);
    meta.filmId = String(filmId);
    meta.filmTitle = filmTitle || "Video";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: cents,
            product_data: {
              name: `Unlock: ${filmTitle || "Video"}`,
              description: "PowerStream TV",
            },
          },
          quantity: 1,
        },
      ],
      success_url: success,
      cancel_url: cancel,
      metadata: {
        ...meta,
        type: "unified_video",
        amountCents: String(cents),
      },
    });
    return { url: session.url, sessionId: session.id };
  }

  if (action === "station_subscription") {
    const cents = Math.max(199, parseInt(amountCents, 10) || 999);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: cents,
            recurring: { interval: "month" },
            product_data: {
              name: stationSlug ? `Subscribe: ${stationSlug}` : "Station subscription",
              description: "Monthly support",
            },
          },
          quantity: 1,
        },
      ],
      success_url: success,
      cancel_url: cancel,
      metadata: {
        ...meta,
        type: "unified_sub",
        amountCents: String(cents),
      },
    });
    return { url: session.url, sessionId: session.id };
  }

  throw new Error(`Unknown action: ${action}`);
}

async function creditCoins(userId, coins) {
  const User = (await import("../../models/User.js")).default;
  await User.findByIdAndUpdate(userId, { $inc: { coinBalance: coins } });
}

export async function handleCheckoutSessionCompleted(session) {
  const sid = session.id;
  const m = session.metadata || {};
  const isLegacySub = m.type === "subscription" && m.userId && m.planId;
  if (!isLegacySub && (await sessionAlreadyRecorded(sid))) {
    if (m.type === "unified_video" && m.userId && m.filmId) {
      await grantPPVEntitlement({
        userId: m.userId,
        purchaseId: null,
        contentType: "film",
        contentId: m.filmId,
        source: "stripe",
        sourceId: session.payment_intent || sid,
      });
    }
    if (m.type === "ppv" && m.userId && m.contentId) {
      await grantPPVEntitlement({
        userId: m.userId,
        purchaseId: null,
        contentType: m.contentType || "film",
        contentId: m.contentId,
        source: "stripe",
        sourceId: session.payment_intent || sid,
      });
    }
    return { duplicate: true };
  }

  const cents =
    parseInt(m.amountCents, 10) ||
    Math.round(session.amount_total || 0) ||
    0;

  if (m.unified === "1") {
    if (m.type === "unified_tip") {
      await recordCompletedPayment({
        userId: m.userId,
        creatorId: m.creatorId || null,
        stationSlug: m.stationSlug || null,
        paymentType: "tip",
        amountCents: cents,
        stripeSessionId: sid,
      });
      return;
    }
    if (m.type === "unified_video") {
      await recordCompletedPayment({
        userId: m.userId,
        creatorId: m.creatorId || null,
        stationSlug: m.stationSlug || null,
        paymentType: "video_purchase",
        amountCents: cents,
        stripeSessionId: sid,
        extraMetadata: { filmId: m.filmId },
      });
      if (m.userId && m.filmId) {
        await grantPPVEntitlement({
          userId: m.userId,
          purchaseId: null,
          contentType: "film",
          contentId: m.filmId,
          source: "stripe",
          sourceId: session.payment_intent || sid,
        });
      }
      return;
    }
    if (m.type === "unified_sub") {
      await recordCompletedPayment({
        userId: m.userId,
        creatorId: m.creatorId || null,
        stationSlug: m.stationSlug || null,
        paymentType: "subscription",
        amountCents: cents || 999,
        stripeSessionId: sid,
        extraMetadata: { stripe_subscription: session.subscription },
      });
      return;
    }
    if (m.type === "unified_coin") {
      const coins = parseInt(m.coins, 10) || 0;
      await recordCompletedPayment({
        userId: m.userId,
        creatorId: null,
        stationSlug: null,
        paymentType: "coin_purchase",
        amountCents: cents,
        stripeSessionId: sid,
        extraMetadata: { packageId: m.packageId, coins },
      });
      if (m.userId && coins) await creditCoins(m.userId, coins);
      return;
    }
  }

  if (m.type === "subscription" && m.userId && m.planId) {
    const Subscription = (await import("../../models/Subscription.js")).default;
    const MonetizationPlan = (await import("../../models/MonetizationPlan.js")).default;
    let sub = await Subscription.findOne({
      providerSubscriptionId: session.subscription,
    });
    const plan = await MonetizationPlan.findById(m.planId);
    if (!sub) {
      sub = await Subscription.create({
        userId: m.userId,
        planId: m.planId,
        stationId: m.stationId || null,
        status: "active",
        provider: "stripe",
        providerCustomerId: session.customer,
        providerSubscriptionId: session.subscription,
        currentPeriodStart: new Date(),
        currentPeriodEnd: null,
      });
      await grantSubscriptionEntitlement({
        userId: m.userId,
        subscriptionId: sub._id,
        planId: m.planId,
        stationId: m.stationId || null,
        isGlobal: plan?.type === "global",
        source: "stripe",
        sourceId: session.subscription,
      });
    }
    if (!(await sessionAlreadyRecorded(sid))) {
      await recordCompletedPayment({
        userId: m.userId,
        creatorId: null,
        stationSlug: null,
        paymentType: "legacy_plan_subscription",
        amountCents: cents,
        stripeSessionId: sid,
        extraMetadata: { planId: m.planId },
      });
    }
    return;
  }

  if (m.type === "ppv" && m.userId && m.contentId) {
    await recordCompletedPayment({
      userId: m.userId,
      creatorId: null,
      stationSlug: null,
      paymentType: "ppv",
      amountCents: cents,
      stripeSessionId: sid,
      extraMetadata: { contentType: m.contentType, contentId: m.contentId },
    });
    await grantPPVEntitlement({
      userId: m.userId,
      purchaseId: null,
      contentType: m.contentType || "film",
      contentId: m.contentId,
      source: "stripe",
      sourceId: session.payment_intent || sid,
    });
    return;
  }

  if (m.userId && m.packageId && m.coins) {
    const c = parseInt(m.coins, 10) || 0;
    await recordCompletedPayment({
      userId: m.userId,
      creatorId: null,
      stationSlug: null,
      paymentType: "coin_purchase",
      amountCents: cents,
      stripeSessionId: sid,
      extraMetadata: { packageId: m.packageId, coins: c, legacy: true },
    });
    if (c) await creditCoins(m.userId, c);
  }
}

/** @deprecated use recordCompletedPayment */
export async function recordPaymentLedger(opts) {
  return recordCompletedPayment({
    userId: opts.user_id,
    creatorId: opts.creator_id,
    stationSlug: opts.station_slug,
    paymentType: opts.type,
    amountCents: opts.amount_cents,
    status: opts.status || "completed",
    stripeSessionId: opts.stripe_checkout_session_id,
    extraMetadata: opts.metadata || {},
  });
}

export async function processTipCompletion(session) {
  await handleCheckoutSessionCompleted(session);
}
export async function processVideoPurchaseCompletion(session) {
  await handleCheckoutSessionCompleted(session);
}
export async function processSubscriptionUnifiedCompletion(session) {
  await handleCheckoutSessionCompleted(session);
}

export async function recordInvoiceRenewalPayment(invoice) {
  const invId = `inv_${invoice.id}`;
  if (await sessionAlreadyRecorded(invId)) return;
  const Subscription = (await import("../../models/Subscription.js")).default;
  const sub = await Subscription.findOne({
    providerSubscriptionId: invoice.subscription,
  });
  if (!sub) return;
  const amount = invoice.amount_paid || 0;
  await recordCompletedPayment({
    userId: sub.userId,
    creatorId: null,
    stationSlug: null,
    paymentType: "subscription_renewal",
    amountCents: amount,
    stripeSessionId: invId,
    extraMetadata: { invoiceId: invoice.id },
  });
}

export default {
  calculateSplit,
  computeRevenueSplit,
  recordCompletedPayment,
  recordLiveTipPayment,
  recordLiveSubscriptionSignal,
  createCheckoutSession,
  handleCheckoutSessionCompleted,
  recordInvoiceRenewalPayment,
};
