import { paginationOptsValidator } from "convex/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("hookLabPosts")
      .withIndex("by_owner_created", (index) => index.eq("ownerId", ownerId))
      .order("desc")
      .paginate({
        ...paginationOpts,
        numItems: Math.max(
          1,
          Math.min(24, Math.floor(paginationOpts.numItems)),
        ),
      });
  },
});
