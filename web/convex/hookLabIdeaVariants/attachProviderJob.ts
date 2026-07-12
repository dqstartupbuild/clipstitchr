import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";

export const attachProviderJob = mutation({
  args: {
    id: v.string(),
    providerJobId: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, providerJobId, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const variant = await ctx.db
      .query("hookLabIdeaVariants")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id),
      )
      .unique();

    if (!variant) {
      throw new Error("Idea version not found.");
    }

    await ctx.db.patch(variant._id, {
      providerJobId: providerJobId.trim().slice(0, 220),
      updatedAt,
    });

    return variant.id;
  },
});
