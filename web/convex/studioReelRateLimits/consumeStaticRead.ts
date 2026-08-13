import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { consumeStudioReelStaticReadRateLimits } from "../studioReel/consumeStudioReelStaticReadRateLimits";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";

export const consumeStaticRead = mutation({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    const { ownerId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    await consumeStudioReelStaticReadRateLimits(ctx, ownerId);
    return { reserved: true };
  },
});
