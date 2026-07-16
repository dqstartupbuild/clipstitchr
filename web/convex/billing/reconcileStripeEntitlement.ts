import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { assertBillingSupportOperatorSecret } from "../auth/assertBillingSupportOperatorSecret";
import { createStripeSdk } from "../../lib/clipstitchr/billing/createStripeSdk";

export const reconcileStripeEntitlement = action({
  args: { actor: v.string(), ownerId: v.string(), secret: v.string() },
  handler: async (ctx, { actor, ownerId, secret }) => {
    assertBillingSupportOperatorSecret(secret);

    const entitlement = await ctx.runQuery(
      internal.billing.getEntitlementForOwner.getEntitlementForOwner,
      { ownerId },
    );

    if (!entitlement) {
      throw new Error("Billing entitlement not found.");
    }

    const subscription = await createStripeSdk().subscriptions.retrieve(
      entitlement.stripeSubscriptionId,
      { expand: ["items.data.price"] },
    );
    const eventCreatedAt = Math.floor(Date.now() / 1_000);

    await ctx.runMutation(
      internal.stripe.reconcileSubscriptionFromStripe
        .reconcileSubscriptionFromStripe,
      {
        actor: actor.trim() || "billing-support",
        eventCreatedAt,
        subscriptionJson: JSON.stringify(subscription),
      },
    );
    await ctx.runMutation(
      internal.usage.reconcileDuplicateUpgradeAllowances
        .reconcileDuplicateUpgradeAllowances,
      {
        actor: actor.trim() || "billing-support",
        now: new Date(eventCreatedAt * 1_000).toISOString(),
        ownerId,
      },
    );

    return {
      reconciledAt: new Date(eventCreatedAt * 1_000).toISOString(),
      stripeSubscriptionId: subscription.id,
    };
  },
});
