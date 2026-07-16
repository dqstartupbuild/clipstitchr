import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { subscriptionCheckoutReturnTargetValidator } from "../validators/subscriptionCheckoutReturnTarget";

export const recordCheckoutSession = internalMutation({
  args: {
    catalogKey: v.string(),
    checkoutIntentId: v.optional(v.string()),
    mode: v.union(v.literal("subscription"), v.literal("payment")),
    ownerId: v.string(),
    returnTarget: v.optional(subscriptionCheckoutReturnTargetValidator),
    stripeCheckoutSessionId: v.string(),
    stripePriceId: v.optional(v.string()),
    now: v.string(),
  },
  handler: async (
    ctx,
    {
      catalogKey,
      checkoutIntentId,
      mode,
      ownerId,
      returnTarget,
      stripeCheckoutSessionId,
      stripePriceId,
      now,
    },
  ) => {
    const existing = await ctx.db
      .query("billingCheckoutSessions")
      .withIndex("by_stripe_session", (query) =>
        query.eq("stripeCheckoutSessionId", stripeCheckoutSessionId),
      )
      .unique();

    if (existing) {
      if (
        existing.ownerId !== ownerId ||
        existing.catalogKey !== catalogKey ||
        existing.mode !== mode
      ) {
        throw new Error("Checkout session ownership does not match.");
      }

      return existing._id;
    }

    const claimed = checkoutIntentId
      ? await ctx.db
          .query("billingCheckoutSessions")
          .withIndex("by_checkout_intent", (query) =>
            query.eq("checkoutIntentId", checkoutIntentId),
          )
          .unique()
      : null;

    if (claimed) {
      if (
        claimed.ownerId !== ownerId ||
        claimed.catalogKey !== catalogKey ||
        claimed.mode !== mode ||
        (claimed.status !== "creating" &&
          claimed.stripeCheckoutSessionId !== stripeCheckoutSessionId)
      ) {
        throw new Error("Checkout intent ownership does not match.");
      }

      await ctx.db.patch(claimed._id, {
        returnTarget: returnTarget ?? claimed.returnTarget,
        status: claimed.status === "creating" ? "created" : claimed.status,
        stripeCheckoutSessionId,
        stripePriceId: stripePriceId ?? claimed.stripePriceId,
        updatedAt: now,
      });

      return claimed._id;
    }

    return await ctx.db.insert("billingCheckoutSessions", {
      catalogKey,
      checkoutIntentId,
      mode,
      ownerId,
      returnTarget,
      stripeCheckoutSessionId,
      stripePriceId,
      status: "created",
      createdAt: now,
      updatedAt: now,
    });
  },
});
