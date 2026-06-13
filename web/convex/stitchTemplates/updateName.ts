import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const updateName = mutation({
  args: {
    id: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { id, name }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const template = await ctx.db
      .query("stitchTemplates")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!template) {
      throw new Error("Template not found.");
    }

    await ctx.db.patch(template._id, {
      name: name.trim() || template.name,
      updatedAt: new Date().toISOString(),
    });
  },
});
