import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const archive = mutation({
  args: {
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const idea = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!idea) {
      return null;
    }

    await ctx.db.patch(idea._id, {
      archivedAt: updatedAt,
      status: "archived",
      updatedAt,
    });

    return idea.id;
  },
});
