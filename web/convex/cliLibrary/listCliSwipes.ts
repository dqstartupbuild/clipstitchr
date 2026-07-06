import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { query } from "../_generated/server";
import { cliLibraryListLimit } from "./cliLibraryListLimit";

export const listCliSwipes = query({
  args: {
    limit: v.optional(v.number()),
    ownerId: v.string(),
    productId: v.optional(v.string()),
    secret: v.string(),
  },
  handler: async (ctx, { limit, ownerId, productId, secret }) => {
    assertRateLimitApiSecret(secret);

    const normalizedProductId = productId?.trim() || undefined;
    const requestedLimit =
      Number.isFinite(limit) && limit && limit > 0
        ? Math.min(Math.floor(limit), cliLibraryListLimit)
        : cliLibraryListLimit;
    const swipes = await ctx.db
      .query("swipeCards")
      .withIndex("by_owner_updated", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(cliLibraryListLimit * 4);

    return swipes
      .filter(
        (swipe) => !normalizedProductId || swipe.productSourceId === normalizedProductId,
      )
      .slice(0, requestedLimit)
      .map((swipe) => ({
        createdAt: swipe.createdAt,
        id: swipe.id,
        isPosted: swipe.isPosted,
        name: swipe.name,
        productId: swipe.productSourceId,
        slideCount: swipe.slides.length,
        updatedAt: swipe.updatedAt,
      }));
  },
});
