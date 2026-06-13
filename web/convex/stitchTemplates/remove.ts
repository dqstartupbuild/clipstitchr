import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordDelete", {
      key: ownerId,
      throws: true,
    });

    const template = await ctx.db
      .query("stitchTemplates")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!template) {
      return null;
    }

    await ctx.db.delete(template._id);
    return template;
  },
});
