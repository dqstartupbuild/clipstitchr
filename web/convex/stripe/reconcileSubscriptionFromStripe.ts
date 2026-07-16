import type Stripe from "stripe";
import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { syncEntitlementFromSubscription } from "./syncEntitlementFromSubscription";

export const reconcileSubscriptionFromStripe = internalMutation({
  args: {
    actor: v.string(),
    eventCreatedAt: v.number(),
    subscriptionJson: v.string(),
  },
  handler: async (ctx, { actor, eventCreatedAt, subscriptionJson }) => {
    const subscription = JSON.parse(subscriptionJson) as Stripe.Subscription;
    const event = {
      id: `reconciliation:${subscription.id}:${eventCreatedAt}:${actor}`,
      created: eventCreatedAt,
      type: "customer.subscription.updated",
    } as Stripe.Event;

    return await syncEntitlementFromSubscription(ctx, event, subscription);
  },
});
