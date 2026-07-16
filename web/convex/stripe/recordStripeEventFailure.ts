import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const recordStripeEventFailure = internalMutation({
  args: {
    error: v.string(),
    eventCreatedAt: v.number(),
    eventId: v.string(),
    eventType: v.string(),
    livemode: v.boolean(),
    objectId: v.optional(v.string()),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stripeWebhookEvents")
      .withIndex("by_event", (query) => query.eq("eventId", args.eventId))
      .unique();
    const fields = {
      error: args.error.slice(0, 1_000),
      eventCreatedAt: args.eventCreatedAt,
      eventId: args.eventId,
      eventType: args.eventType,
      livemode: args.livemode,
      objectId: args.objectId,
      status: "failed" as const,
      updatedAt: args.now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
      return existing._id;
    }

    return await ctx.db.insert("stripeWebhookEvents", {
      ...fields,
      createdAt: args.now,
    });
  },
});
