// backend/services/payments/index.js
// Payment Services Index

export * as stripeService from "./stripeService.js";
export * as paypalService from "./paypalService.js";
export * as applePayService from "./applePayService.js";

// Re-export default objects
import stripeService from "./stripeService.js";
import paypalService from "./paypalService.js";
import applePayService from "./applePayService.js";

export default {
  stripe: stripeService,
  paypal: paypalService,
  apple: applePayService,
};










