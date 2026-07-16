import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { rateLimiter } from "../rateLimiter";
import { upsertProductCard } from "../upsertProductCard";
import { assertProductLimit } from "./assertProductLimit";

export const restoreProduct = mutation({
  args: { id: v.string(), now: v.string() },
  handler: async (ctx, { id, now }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

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

    if (!product || !product.archivedAt) {
      return product?._id ?? null;
    }

    await assertProductLimit(ctx, ownerId, now);
    const restored = { ...product, archivedAt: undefined, updatedAt: now };

    await ctx.db.patch(product._id, {
      archivedAt: undefined,
      updatedAt: now,
    });
    await upsertProductCard(ctx, restored);

    return product._id;
  },
});
