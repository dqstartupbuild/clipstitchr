import { v } from "convex/values";
import { createCheckoutIntentId } from "../../lib/clipstitchr/billing/createCheckoutIntentId";
import { internalMutation } from "../_generated/server";
import { planKeyValidator } from "../validators/planKey";
import { subscriptionCheckoutReturnTargetValidator } from "../validators/subscriptionCheckoutReturnTarget";

export const claimSubscriptionCheckoutSession = internalMutation({
  args: {
    now: v.string(),
    ownerId: v.string(),
    planKey: planKeyValidator,
    returnTarget: subscriptionCheckoutReturnTargetValidator,
  },
  handler: async (ctx, { now, ownerId, planKey, returnTarget }) => {
    if (!Number.isFinite(Date.parse(now))) {
      throw new Error("Subscription Checkout requires a valid server time.");
    }

    const [creating, handedOff, created, expiring, completed] =
      await Promise.all([
        ctx.db
          .query("billingCheckoutSessions")
          .withIndex("by_owner_mode_status", (query) =>
            query
              .eq("ownerId", ownerId)
              .eq("mode", "subscription")
              .eq("status", "creating"),
          )
          .order("desc")
          .first(),
        ctx.db
          .query("billingCheckoutSessions")
          .withIndex("by_owner_mode_status", (query) =>
            query
              .eq("ownerId", ownerId)
              .eq("mode", "subscription")
              .eq("status", "handedOff"),
          )
          .order("desc")
          .first(),
        ctx.db
          .query("billingCheckoutSessions")
          .withIndex("by_owner_mode_status", (query) =>
            query
              .eq("ownerId", ownerId)
              .eq("mode", "subscription")
              .eq("status", "created"),
          )
          .order("desc")
          .first(),
        ctx.db
          .query("billingCheckoutSessions")
          .withIndex("by_owner_mode_status", (query) =>
            query
              .eq("ownerId", ownerId)
              .eq("mode", "subscription")
              .eq("status", "expiring"),
          )
          .order("desc")
          .first(),
        ctx.db
          .query("billingCheckoutSessions")
          .withIndex("by_owner_mode_status", (query) =>
            query
              .eq("ownerId", ownerId)
              .eq("mode", "subscription")
              .eq("status", "completed"),
          )
          .order("desc")
          .first(),
      ]);
    const existing = [creating, created, handedOff, expiring, completed]
      .filter(
        (session): session is NonNullable<typeof session> => session !== null,
      )
      .sort((left, right) => right._creationTime - left._creationTime)[0];

    if (existing) {
      return {
        catalogKey: existing.catalogKey,
        checkoutIntentId: existing.checkoutIntentId,
        createdAt: existing.createdAt,
        returnTarget: existing.returnTarget ?? "settings",
        status: existing.status,
        stripeCheckoutSessionId: existing.stripeCheckoutSessionId,
      };
    }

    const checkoutIntentId = createCheckoutIntentId();
    const stripeCheckoutSessionId = `pending:${checkoutIntentId}`;

    await ctx.db.insert("billingCheckoutSessions", {
      catalogKey: planKey,
      checkoutIntentId,
      createdAt: now,
      mode: "subscription",
      ownerId,
      returnTarget,
      status: "creating",
      stripeCheckoutSessionId,
      updatedAt: now,
    });

    return {
      catalogKey: planKey,
      checkoutIntentId,
      createdAt: now,
      returnTarget,
      status: "creating" as const,
      stripeCheckoutSessionId,
    };
  },
});
