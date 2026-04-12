// backend/src/services/payments/paymentService.js
// Unified Payment Service - Handles all payment providers with graceful degradation

import { features, serviceNotConfiguredResponse } from '../../config/featureFlags.js';
import Stripe from 'stripe';

import { getCoinPackages as loadCoinPackages } from '../../../services/monetization/coinPackages.js';

/**
 * Lazy-initialized Stripe client
 */
let stripeClient = null;
function getStripe() {
  if (!features.stripe) return null;
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

/**
 * Get available coin packages
 */
export function getCoinPackages() {
  return loadCoinPackages();
}

/**
 * Get payment service status
 */
export function getPaymentStatus() {
  return {
    stripe: {
      enabled: features.stripe,
      mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test',
    },
    paypal: {
      enabled: features.paypal,
      mode: process.env.PAYPAL_MODE || 'sandbox',
    },
    crypto: {
      enabled: !!process.env.METAMASK_ENABLED,
      networks: ['ethereum', 'polygon'],
    },
    applePay: {
      enabled: features.stripe, // Apple Pay through Stripe
    },
  };
}

/**
 * Check if any payment method is available
 */
export function isPaymentAvailable() {
  return features.stripe || features.paypal;
}

/**
 * @deprecated All checkout goes through unifiedPaymentService.createCheckoutSession(action: coin_purchase)
 */
export async function createStripeCheckout({ userId, userEmail, packageId, successUrl, cancelUrl }) {
  try {
    const { createCheckoutSession } = await import('../../../services/monetization/unifiedPaymentService.js');
    const { url, sessionId } = await createCheckoutSession({
      userId,
      userEmail: userEmail || '',
      action: 'coin_purchase',
      packageId,
      successUrl,
      cancelUrl,
    });
    return { ok: true, sessionId, url };
  } catch (e) {
    if (!getStripe()) {
      return serviceNotConfiguredResponse('Stripe', 'Payment processing is not available.');
    }
    return { ok: false, error: e.message || 'Failed to create checkout session' };
  }
}

/**
 * Verify Stripe webhook event
 */
export function verifyStripeWebhook(payload, signature) {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: 'Stripe not configured' };
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return { ok: true, event };
  } catch (error) {
    console.error('[PaymentService] Webhook verification failed:', error.message);
    return { ok: false, error: error.message };
  }
}

/** @deprecated Use Stripe webhook → unifiedPaymentService.handleCheckoutSessionCompleted */
export async function processPaymentSuccess(session) {
  const { handleCheckoutSessionCompleted } = await import(
    "../../../services/monetization/unifiedPaymentService.js"
  );
  await handleCheckoutSessionCompleted(session);
  return { ok: true };
}

export default {
  getCoinPackages,
  getPaymentStatus,
  isPaymentAvailable,
  createStripeCheckout,
  verifyStripeWebhook,
  processPaymentSuccess,
};












