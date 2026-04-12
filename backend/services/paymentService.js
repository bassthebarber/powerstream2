/**
 * Single monetization facade — all payment logic lives in unifiedPaymentService + splitService.
 */
export {
  createCheckoutSession,
  calculateSplit,
  computeRevenueSplit,
  recordCompletedPayment,
  recordPaymentLedger,
  recordLiveTipPayment,
  handleCheckoutSessionCompleted,
  PLATFORM_CUT,
  CREATOR_CUT,
} from "./monetization/unifiedPaymentService.js";
