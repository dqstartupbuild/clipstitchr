import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { rateLimiter } from "../rateLimiter";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioPublishingActiveProduct } from "./assertStudioPublishingActiveProduct";

export const getActiveProductScope = mutation({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);

    const preference = await ctx.db
      .query("productPreferences")
      .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
      .unique();
    const productId = preference?.defaultProductId;

    if (!productId) {
      throw new Error("Choose an active Product before opening Postiz Beta.");
    }

    const product = await assertStudioPublishingActiveProduct(
      ctx,
      ownerId,
      productId,
    );

    await rateLimiter.limit(ctx, "studioPublishingStaticRead", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "studioPublishingStaticReadGlobal", {
      throws: true,
    });

    return {
      ownerId,
      productId: product.id,
      productName: product.name,
    };
  },
});
