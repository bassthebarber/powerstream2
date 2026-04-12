// backend/services/monetization/entitlementsService.js
// Entitlements Service - Grant and check user access rights

import Entitlement from "../../models/Entitlement.js";
import Subscription from "../../models/Subscription.js";

/**
 * Grant subscription entitlement to user
 */
export async function grantSubscriptionEntitlement({
  userId,
  subscriptionId,
  planId,
  stationId = null,
  isGlobal = false,
  validFrom = new Date(),
  validTo = null,
  source = "stripe",
  sourceId = null,
}) {
  // Check for existing entitlement
  const existingQuery = {
    userId,
    entitlementType: "subscription",
    subscriptionId,
    active: true,
  };

  const existing = await Entitlement.findOne(existingQuery);
  
  if (existing) {
    // Update existing entitlement
    existing.validTo = validTo;
    existing.validFrom = validFrom;
    return existing.save();
  }

  // Create new entitlement
  const entitlement = new Entitlement({
    userId,
    entitlementType: "subscription",
    stationId,
    contentType: stationId ? "station" : "all",
    contentId: stationId,
    validFrom,
    validTo,
    source,
    sourceId,
    subscriptionId,
    isGlobal,
    active: true,
  });

  return entitlement.save();
}

/**
 * Grant PPV entitlement to user
 */
export async function grantPPVEntitlement({
  userId,
  purchaseId,
  contentType,
  contentId,
  validFrom = new Date(),
  validTo = null,
  source = "stripe",
  sourceId = null,
}) {
  // Check for existing entitlement
  const existingQuery = {
    userId,
    entitlementType: "ppv",
    contentType,
    contentId,
    active: true,
  };

  const existing = await Entitlement.findOne(existingQuery);
  
  if (existing) {
    // Update validity if new one is longer
    if (!existing.validTo || (validTo && validTo > existing.validTo)) {
      existing.validTo = validTo;
    }
    return existing.save();
  }

  // Create new entitlement
  const entitlement = new Entitlement({
    userId,
    entitlementType: "ppv",
    contentType,
    contentId,
    validFrom,
    validTo,
    source,
    sourceId,
    purchaseId,
    isGlobal: false,
    active: true,
  });

  return entitlement.save();
}

/**
 * Grant free/promo entitlement to user
 */
export async function grantPromoEntitlement({
  userId,
  contentType,
  contentId,
  stationId = null,
  validFrom = new Date(),
  validTo,
  source = "promo",
  sourceId = null,
  isGlobal = false,
}) {
  const entitlement = new Entitlement({
    userId,
    entitlementType: "promo",
    stationId,
    contentType,
    contentId,
    validFrom,
    validTo,
    source,
    sourceId,
    isGlobal,
    active: true,
  });

  return entitlement.save();
}

/**
 * Check if user has entitlement for content
 */
export async function userHasEntitlement(userId, contentType, contentId, stationId = null) {
  return Entitlement.userHasEntitlement(userId, contentType, contentId, stationId);
}

/**
 * Check if user has active subscription (any)
 */
export async function userHasActiveSubscription(userId, stationId = null) {
  const now = new Date();
  const query = {
    userId,
    active: true,
    entitlementType: "subscription",
    validFrom: { $lte: now },
    $or: [{ validTo: null }, { validTo: { $gt: now } }],
  };

  if (stationId) {
    query.$or = [
      { stationId },
      { isGlobal: true },
    ];
  }

  const entitlement = await Entitlement.findOne(query);
  return !!entitlement;
}

/**
 * Get all user entitlements
 */
export async function getUserEntitlements(userId) {
  return Entitlement.getUserEntitlements(userId);
}

/**
 * Revoke entitlement
 */
export async function revokeEntitlement(entitlementId, reason = "manual") {
  const entitlement = await Entitlement.findById(entitlementId);
  if (!entitlement) {
    throw new Error("Entitlement not found");
  }
  return entitlement.revoke(reason);
}

/**
 * Revoke all entitlements for a subscription
 */
export async function revokeSubscriptionEntitlements(subscriptionId, reason = "subscription_canceled") {
  const entitlements = await Entitlement.find({ subscriptionId, active: true });
  
  for (const entitlement of entitlements) {
    await entitlement.revoke(reason);
  }

  return entitlements.length;
}

/**
 * Extend subscription entitlement validity
 */
export async function extendSubscriptionEntitlement(subscriptionId, newValidTo) {
  const entitlements = await Entitlement.find({
    subscriptionId,
    active: true,
    entitlementType: "subscription",
  });

  for (const entitlement of entitlements) {
    entitlement.validTo = newValidTo;
    await entitlement.save();
  }

  return entitlements.length;
}

/**
 * Check content access (combined logic for films, events, etc.)
 */
export async function checkContentAccess(userId, contentType, contentId, stationId = null, monetizationType = "free") {
  // Free content - always accessible
  if (monetizationType === "free") {
    return { hasAccess: true, reason: "free_content" };
  }

  // Check if user has direct entitlement
  const hasEntitlement = await userHasEntitlement(userId, contentType, contentId, stationId);
  if (hasEntitlement) {
    return { hasAccess: true, reason: "entitlement" };
  }

  // Check if user has subscription access
  if (monetizationType === "subscription" && stationId) {
    const hasSubscription = await userHasActiveSubscription(userId, stationId);
    if (hasSubscription) {
      return { hasAccess: true, reason: "subscription" };
    }
  }

  // Check for global subscription
  const hasGlobalSub = await userHasActiveSubscription(userId, null);
  if (hasGlobalSub) {
    return { hasAccess: true, reason: "global_subscription" };
  }

  return { hasAccess: false, reason: "no_access" };
}

export default {
  grantSubscriptionEntitlement,
  grantPPVEntitlement,
  grantPromoEntitlement,
  userHasEntitlement,
  userHasActiveSubscription,
  getUserEntitlements,
  revokeEntitlement,
  revokeSubscriptionEntitlements,
  extendSubscriptionEntitlement,
  checkContentAccess,
};










