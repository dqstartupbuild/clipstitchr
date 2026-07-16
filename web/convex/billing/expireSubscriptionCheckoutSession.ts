import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const expireSubscriptionCheckoutSession = internalMutation({
  args: {
    now: v.string(),
    ownerId: v.string(),
    stripeCheckoutSessionId: v.string(),
  },
  handler: async (ctx, { now, ownerId, stripeCheckoutSessionId }) => {
    const session = await ctx.db
      .query("billingCheckoutSessions")
      .withIndex("by_stripe_session", (query) =>
        query.eq("stripeCheckoutSessionId", stripeCheckoutSessionId),
      )
      .unique();

    if (!session || session.ownerId !== ownerId) {
      return null;
    }

    await ctx.db.patch(session._id, {
      status: "expired",
      updatedAt: now,
    });

    return session._id;
  },
});
