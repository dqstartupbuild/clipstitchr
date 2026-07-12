import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const use = await ctx.db
      .query("hookLabIdeaUses")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!use) {
      return null;
    }

    const variants = await ctx.db
      .query("hookLabIdeaVariants")
      .withIndex("by_owner_use_variant", (index) =>
        index.eq("ownerId", ownerId).eq("useId", use.id),
      )
      .order("asc")
      .take(5);

    return { use, variants };
  },
});
