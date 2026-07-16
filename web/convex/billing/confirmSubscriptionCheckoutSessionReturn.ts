import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { subscriptionCheckoutReturnTargetValidator } from "../validators/subscriptionCheckoutReturnTarget";

export const confirmSubscriptionCheckoutSessionReturn = internalMutation({
  args: {
    catalogKey: v.string(),
    checkoutIntentId: v.string(),
    now: v.string(),
    ownerId: v.string(),
    returnTarget: subscriptionCheckoutReturnTargetValidator,
    stripeCheckoutSessionId: v.string(),
  },
  returns: v.boolean(),
  handler: async (
    ctx,
    {
      catalogKey,
      checkoutIntentId,
      now,
      ownerId,
      returnTarget,
      stripeCheckoutSessionId,
    },
  ) => {
    if (!Number.isFinite(Date.parse(now))) {
      throw new Error("Subscription Checkout requires a valid server time.");
    }

    const session = await ctx.db
      .query("billingCheckoutSessions")
      .withIndex("by_checkout_intent", (query) =>
        query.eq("checkoutIntentId", checkoutIntentId),
      )
      .unique();

    if (
      !session ||
      session.ownerId !== ownerId ||
      session.catalogKey !== catalogKey ||
      session.mode !== "subscription" ||
      session.returnTarget !== returnTarget ||
      session.stripeCheckoutSessionId !== stripeCheckoutSessionId ||
      (session.status !== "created" && session.status !== "handedOff")
    ) {
      return false;
    }

    if (session.status === "created") {
      await ctx.db.patch(session._id, {
        handedOffAt: now,
        status: "handedOff",
        updatedAt: now,
      });
    }

    return true;
  },
});
