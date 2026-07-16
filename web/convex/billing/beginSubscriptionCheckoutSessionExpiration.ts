import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const beginSubscriptionCheckoutSessionExpiration = internalMutation({
  args: {
    allowHandedOff: v.boolean(),
    now: v.string(),
    ownerId: v.string(),
    stripeCheckoutSessionId: v.string(),
  },
  returns: v.boolean(),
  handler: async (
    ctx,
    { allowHandedOff, now, ownerId, stripeCheckoutSessionId },
  ) => {
    if (!Number.isFinite(Date.parse(now))) {
      throw new Error("Subscription Checkout requires a valid server time.");
    }

    const session = await ctx.db
      .query("billingCheckoutSessions")
      .withIndex("by_stripe_session", (query) =>
        query.eq("stripeCheckoutSessionId", stripeCheckoutSessionId),
      )
      .unique();

    if (
      !session ||
      session.ownerId !== ownerId ||
      session.mode !== "subscription" ||
      (session.status !== "created" &&
        !(session.status === "handedOff" && allowHandedOff))
    ) {
      return false;
    }

    await ctx.db.patch(session._id, {
      status: "expiring",
      updatedAt: now,
    });

    return true;
  },
});
