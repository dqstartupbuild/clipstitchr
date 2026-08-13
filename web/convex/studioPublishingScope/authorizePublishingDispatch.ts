import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { rateLimiter } from "../rateLimiter";
import { getStudioBetaAccessStateForOwner } from "../studioBetaAccess/getStudioBetaAccessStateForOwner";

export const authorizePublishingDispatch = mutation({
  args: {
    ownerId: v.string(),
    productId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);

    const access = await getStudioBetaAccessStateForOwner(ctx, args.ownerId);
    if (!access.hasAccess) {
      return { allowed: false };
    }

    const product = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", args.ownerId).eq("id", args.productId),
      )
      .unique();

    if (!product || product.archivedAt) {
      return { allowed: false };
    }

    await rateLimiter.limit(ctx, "studioPublishingStaticRead", {
      key: args.ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "studioPublishingStaticReadGlobal", {
      throws: true,
    });

    return { allowed: true };
  },
});
