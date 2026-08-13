import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { consumeStudioClipsStaticReadRateLimits } from "./consumeStudioClipsStaticReadRateLimits";
import { assertStudioClipsActiveProduct } from "../studioClipsTasks/assertStudioClipsActiveProduct";
import { assertStudioClipsIdentifier } from "../studioClipsTasks/assertStudioClipsIdentifier";

export const reserveStaticRead = mutation({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    await consumeStudioClipsStaticReadRateLimits(ctx, ownerId);
    return { reserved: true };
  },
});
