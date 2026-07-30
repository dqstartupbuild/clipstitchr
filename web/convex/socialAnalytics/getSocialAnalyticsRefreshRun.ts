import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";

export const getSocialAnalyticsRefreshRun = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("socialAnalyticsRefreshRuns")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
  },
});
