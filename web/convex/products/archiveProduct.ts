import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { deleteProductCard } from "../deleteProductCard";
import { rateLimiter } from "../rateLimiter";
import { disableProductAutomation } from "./disableProductAutomation";

export const archiveProduct = mutation({
  args: { id: v.string(), now: v.string() },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const now = new Date().toISOString();

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const product = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", ownerId).eq("id", id),
      )
      .unique();

    if (!product || product.archivedAt) {
      return product?._id ?? null;
    }

    await ctx.db.patch(product._id, { archivedAt: now, updatedAt: now });
    await deleteProductCard(ctx, product);
    await disableProductAutomation(ctx, ownerId, product.id, now);

    const preferences = await ctx.db
      .query("productPreferences")
      .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
      .unique();

    if (preferences?.defaultProductId === id) {
      await ctx.db.patch(preferences._id, {
        defaultProductId: undefined,
        updatedAt: now,
      });
    }

    return product._id;
  },
});
