import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const undoFeedback = mutation({
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

    const wasNotForMe = option.reviewState === "not_for_me";

    await ctx.db.patch(option._id, {
      linkedIdeaId: undefined,
      rejectionReason: undefined,
      reviewState: "needs_review",
      reviewedAt: undefined,
      updatedAt,
    });

    if (wasNotForMe && option.productId) {
      const product = await ctx.db
        .query("products")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", option.productId!),
        )
        .unique();

      if (product) {
        await ctx.db.patch(product._id, {
          rejectedHookExamples: (product.rejectedHookExamples ?? []).filter(
            (example) =>
              example.trim().toLowerCase() !== option.normalizedHook,
          ),
          updatedAt,
        });
      }
    }

    return option.id;
  },
});
