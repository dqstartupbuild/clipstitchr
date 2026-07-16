import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getEntitlementForOwner = internalQuery({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) =>
    await ctx.db
      .query("billingEntitlements")
      .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
      .unique(),
});
