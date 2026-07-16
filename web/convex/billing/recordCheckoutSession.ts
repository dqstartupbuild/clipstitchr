import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const recordCheckoutSession = internalMutation({
  args: {
    catalogKey: v.string(),
    mode: v.union(v.literal("subscription"), v.literal("payment")),
    ownerId: v.string(),
    stripeCheckoutSessionId: v.string(),
    now: v.string(),
  },
  handler: async (
    ctx,
    { catalogKey, mode, ownerId, stripeCheckoutSessionId, now },
  ) => {
    const existing = await ctx.db
      .query("billingCheckoutSessions")
      .withIndex("by_stripe_session", (query) =>
        query.eq("stripeCheckoutSessionId", stripeCheckoutSessionId),
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("billingCheckoutSessions", {
      catalogKey,
      mode,
      ownerId,
      stripeCheckoutSessionId,
      status: "created",
      createdAt: now,
      updatedAt: now,
    });
  },
});
