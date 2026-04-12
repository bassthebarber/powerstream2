// Stripe webhook — verify signature, delegate ALL payment side-effects to unifiedPaymentService.
import { verifyWebhook } from "../services/payments/stripeService.js";
import {
  handleCheckoutSessionCompleted,
  recordInvoiceRenewalPayment,
} from "../services/monetization/unifiedPaymentService.js";
import Subscription from "../models/Subscription.js";
import { extendSubscriptionEntitlement } from "../services/monetization/entitlementsService.js";

export async function handleStripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = verifyWebhook(req.body, signature);
  } catch (err) {
    console.error("Stripe webhook verify failed:", err.message);
    return res.status(400).json({ error: err.message });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "invoice.paid": {
        const invoice = event.data.object;
        await recordInvoiceRenewalPayment(invoice);
        if (invoice.subscription) {
          const subscription = await Subscription.findOne({
            providerSubscriptionId: invoice.subscription,
          });
          if (subscription) {
            subscription.status = "active";
            subscription.currentPeriodStart = new Date(invoice.period_start * 1000);
            subscription.currentPeriodEnd = new Date(invoice.period_end * 1000);
            await subscription.save();
            await extendSubscriptionEntitlement(
              subscription._id,
              subscription.currentPeriodEnd
            );
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;
        const subscription = await Subscription.findOne({
          providerSubscriptionId: invoice.subscription,
        });
        if (subscription) {
          subscription.status = "past_due";
          await subscription.save();
        }
        break;
      }

      case "customer.subscription.updated": {
        const stripeSubscription = event.data.object;
        const subscription = await Subscription.findOne({
          providerSubscriptionId: stripeSubscription.id,
        });
        if (!subscription) break;
        const statusMap = {
          active: "active",
          past_due: "past_due",
          canceled: "canceled",
          incomplete: "incomplete",
          incomplete_expired: "canceled",
          trialing: "trialing",
          paused: "paused",
        };
        subscription.status =
          statusMap[stripeSubscription.status] || "active";
        subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
        subscription.currentPeriodStart = new Date(
          stripeSubscription.current_period_start * 1000
        );
        subscription.currentPeriodEnd = new Date(
          stripeSubscription.current_period_end * 1000
        );
        await subscription.save();
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSubscription = event.data.object;
        const subscription = await Subscription.findOne({
          providerSubscriptionId: stripeSubscription.id,
        });
        if (!subscription) break;
        subscription.status = "canceled";
        subscription.canceledAt = new Date();
        await subscription.save();
        const { revokeSubscriptionEntitlements } = await import(
          "../services/monetization/entitlementsService.js"
        );
        await revokeSubscriptionEntitlements(
          subscription._id,
          "subscription_canceled"
        );
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`Webhook handler error ${event.type}:`, error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

export default { handleStripeWebhook };
