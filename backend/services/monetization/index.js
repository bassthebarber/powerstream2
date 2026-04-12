// backend/services/monetization/index.js
// Monetization Services Index

export * as entitlementsService from "./entitlementsService.js";

import entitlementsService from "./entitlementsService.js";

export default {
  entitlements: entitlementsService,
};
