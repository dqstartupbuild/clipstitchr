import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const markNotForMe = mutation({
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

    const option = await ctx.db
      .query("stitchrHookOptions")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!option) {
      throw new Error("Hook not found.");
    }

    await ctx.db.patch(option._id, {
      reviewState: "not_for_me",
      reviewedAt: updatedAt,
      updatedAt,
    });

    if (option.productId) {
      const product = await ctx.db
        .query("products")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", option.productId!),
        )
        .unique();

      if (product) {
        const rejectedHookExamples = Array.from(
          new Set([option.hook, ...(product.rejectedHookExamples ?? [])]),
        ).slice(0, 20);
        await ctx.db.patch(product._id, {
          rejectedHookExamples,
          updatedAt,
        });
      }
    }

    return option.id;
  },
});
