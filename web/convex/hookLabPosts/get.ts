import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("hookLabPosts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();
  },
});
