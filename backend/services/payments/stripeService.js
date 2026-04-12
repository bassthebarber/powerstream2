// backend/services/payments/stripeService.js
// Stripe Payment Service - Checkout Sessions, Webhooks
import Stripe from "stripe";

// Initialize Stripe (lazy - only when needed)
let stripeInstance = null;

function getStripe() {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.warn("⚠️ STRIPE_SECRET_KEY not configured - Stripe payments disabled");
      return null;
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });
  }
  return stripeInstance;
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}

/**
 * Create a Stripe Checkout Session for Subscription
 */
export async function createCheckoutSessionSubscription({
  userId,
  userEmail,
  plan,
  stationId = null,
  successUrl,
  cancelUrl,
}) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const metadata = {
    userId: userId.toString(),
    planId: plan._id.toString(),
    type: "subscription",
  };

  if (stationId) {
    metadata.stationId = stationId.toString();
  }

  const sessionParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: userEmail,
    metadata,
    success_url: successUrl || `${appUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${appUrl}/subscription/cancel`,
    line_items: [],
  };

  // Use existing Stripe Price ID or create line item
  if (plan.stripePriceId) {
    sessionParams.line_items.push({
      price: plan.stripePriceId,
      quantity: 1,
    });
  } else {
    sessionParams.line_items.push({
      price_data: {
        currency: plan.currency || "usd",
        unit_amount: plan.priceCents,
        recurring: {
          interval: plan.interval || "month",
          interval_count: plan.intervalCount || 1,
        },
        product_data: {
          name: plan.name,
          description: plan.description || `${plan.name} Subscription`,
        },
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Create a Stripe Checkout Session for PPV (one-time payment)
 */
export async function createCheckoutSessionPPV({
  userId,
  userEmail,
  contentType,
  contentId,
  contentTitle,
  amountCents,
  currency = "usd",
  successUrl,
  cancelUrl,
}) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const metadata = {
    userId: userId.toString(),
    contentType,
    contentId: contentId.toString(),
    type: "ppv",
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: userEmail,
    metadata,
    success_url: successUrl || `${appUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${appUrl}/purchase/cancel`,
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amountCents,
          product_data: {
            name: contentTitle || `${contentType} Purchase`,
            description: `One-time access to ${contentTitle || contentType}`,
          },
        },
        quantity: 1,
      },
    ],
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhook(rawBody, signature) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  }

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

/**
 * Retrieve a Checkout Session
 */
export async function retrieveCheckoutSession(sessionId) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "payment_intent"],
  });
}

/**
 * Cancel a Subscription
 */
export async function cancelSubscription(subscriptionId, atPeriodEnd = true) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  if (atPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get Subscription details
 */
export async function getSubscription(subscriptionId) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Create or get Stripe Customer
 */
export async function getOrCreateCustomer(email, userId) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  // Search for existing customer
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  return stripe.customers.create({
    email,
    metadata: {
      userId: userId.toString(),
    },
  });
}

/**
 * Create a Stripe Product and Price
 */
export async function createProductAndPrice(plan) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  // Create product
  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description || plan.name,
  });

  // Create price
  const priceData = {
    product: product.id,
    currency: plan.currency || "usd",
    unit_amount: plan.priceCents,
  };

  if (plan.type === "subscription") {
    priceData.recurring = {
      interval: plan.interval || "month",
      interval_count: plan.intervalCount || 1,
    };
  }

  const price = await stripe.prices.create(priceData);

  return {
    productId: product.id,
    priceId: price.id,
  };
}

export default {
  isStripeConfigured,
  createCheckoutSessionSubscription,
  createCheckoutSessionPPV,
  verifyWebhook,
  retrieveCheckoutSession,
  cancelSubscription,
  getSubscription,
  getOrCreateCustomer,
  createProductAndPrice,
};










