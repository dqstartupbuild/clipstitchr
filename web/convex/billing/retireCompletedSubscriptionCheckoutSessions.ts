import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const retireCompletedSubscriptionCheckoutSessions = internalMutation({
  args: {
    now: v.string(),
    ownerId: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, { now, ownerId }) => {
    if (!Number.isFinite(Date.parse(now))) {
      throw new Error("Subscription Checkout requires a valid server time.");
    }

    const completedSessions = await ctx.db
      .query("billingCheckoutSessions")
      .withIndex("by_owner_mode_status", (query) =>
        query
          .eq("ownerId", ownerId)
          .eq("mode", "subscription")
          .eq("status", "completed"),
      )
      .collect();

    await Promise.all(
      completedSessions.map((session) =>
        ctx.db.patch(session._id, {
          status: "retired",
          updatedAt: now,
        }),
      ),
    );

    return completedSessions.length;
  },
});
