import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";

const STITCH_TEMPLATE_LIST_LIMIT = 200;

export const list = query({
  args: {
    sortOrder: v.optional(v.union(v.literal("newest"), v.literal("oldest"))),
  },
  handler: async (ctx, { sortOrder }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("stitchTemplates")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order(sortOrder === "oldest" ? "asc" : "desc")
      .take(STITCH_TEMPLATE_LIST_LIMIT);
  },
});
