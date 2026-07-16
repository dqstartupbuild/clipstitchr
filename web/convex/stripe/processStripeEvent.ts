import type Stripe from "stripe";
import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { activateEntitlementFromInvoice } from "./activateEntitlementFromInvoice";
import { assertStripeEventMode } from "./assertStripeEventMode";
import { clearBillingReviewForCustomer } from "./clearBillingReviewForCustomer";
import { getStripeResourceId } from "./getStripeResourceId";
import { grantConfirmedCreditRefill } from "./grantConfirmedCreditRefill";
import { markCheckoutSessionCompleted } from "./markCheckoutSessionCompleted";
import { markEntitlementInactiveForCustomer } from "./markEntitlementInactiveForCustomer";
import { markEntitlementPaymentFailed } from "./markEntitlementPaymentFailed";
import { restoreGrantForCharge } from "./restoreGrantForCharge";
import { revokeGrantForCharge } from "./revokeGrantForCharge";
import { syncEntitlementFromSubscription } from "./syncEntitlementFromSubscription";

export const processStripeEvent = internalMutation({
  args: { eventJson: v.string() },
  handler: async (ctx, { eventJson }) => {
    const event = JSON.parse(eventJson) as Stripe.Event;

    assertStripeEventMode(event.livemode);

    const now = new Date(event.created * 1_000).toISOString();
    const object = event.data.object as { id?: string };
    const existing = await ctx.db
      .query("stripeWebhookEvents")
      .withIndex("by_event", (query) => query.eq("eventId", event.id))
      .unique();

    if (existing?.status === "processed" || existing?.status === "ignored") {
      return existing.status;
    }

    const eventFields = {
      error: undefined,
      eventCreatedAt: event.created,
      eventId: event.id,
      eventType: event.type,
      livemode: event.livemode,
      objectId: object.id,
      status: "processing" as const,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, eventFields);
    } else {
      await ctx.db.insert("stripeWebhookEvents", {
        ...eventFields,
        createdAt: now,
      });
    }

    let processed = true;

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncEntitlementFromSubscription(
          ctx,
          event,
          event.data.object as Stripe.Subscription,
        );
        break;
      case "invoice.paid":
        await activateEntitlementFromInvoice(
          ctx,
          event,
          event.data.object as Stripe.Invoice,
        );
        break;
      case "invoice.payment_failed":
        await markEntitlementPaymentFailed(
          ctx,
          event,
          event.data.object as Stripe.Invoice,
        );
        break;
      case "payment_intent.succeeded":
        await grantConfirmedCreditRefill(
          ctx,
          event,
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case "checkout.session.completed":
        await markCheckoutSessionCompleted(
          ctx,
          event,
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "charge.refunded":
        await revokeGrantForCharge(
          ctx,
          event,
          event.data.object as Stripe.Charge,
          "Stripe payment refunded",
        );
        break;
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const charge = dispute.charge;

        if (typeof charge === "string") {
          throw new Error("Stripe dispute event is missing its expanded charge.");
        }

        await revokeGrantForCharge(
          ctx,
          event,
          charge,
          "Stripe payment dispute opened",
        );
        break;
      }
      case "charge.dispute.closed": {
        const dispute = event.data.object as Stripe.Dispute;
        const charge = dispute.charge;

        if (typeof charge === "string") {
          throw new Error("Stripe dispute event is missing its expanded charge.");
        }

        if (dispute.status === "won") {
          await restoreGrantForCharge(ctx, event, charge);

          const customerId = getStripeResourceId(charge.customer);
          if (customerId) {
            await clearBillingReviewForCustomer(ctx, customerId, now);
          }
        } else {
          await revokeGrantForCharge(
            ctx,
            event,
            charge,
            "Stripe payment dispute closed without recovery",
          );
        }
        break;
      }
      case "customer.deleted":
        await markEntitlementInactiveForCustomer(ctx, {
          customerId: event.data.object.id,
          eventCreatedAt: event.created,
          eventId: event.id,
          eventType: event.type,
          reason: "Stripe customer deleted",
        });
        break;
      default:
        processed = false;
    }

    const storedEvent = await ctx.db
      .query("stripeWebhookEvents")
      .withIndex("by_event", (query) => query.eq("eventId", event.id))
      .unique();

    if (!storedEvent) {
      throw new Error("Stripe event claim disappeared during processing.");
    }

    await ctx.db.patch(storedEvent._id, {
      processedAt: now,
      status: processed ? "processed" : "ignored",
      updatedAt: now,
    });

    return processed ? "processed" : "ignored";
  },
});
