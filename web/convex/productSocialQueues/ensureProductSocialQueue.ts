import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertProductBelongsToOwner } from "../assertProductBelongsToOwner";
import { rateLimiter } from "../rateLimiter";
import { createInitialProductSocialQueue } from "./createInitialProductSocialQueue";

export const ensureProductSocialQueue = mutation({
  args: {
    productId: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    await assertProductBelongsToOwner(ctx, ownerId, args.productId);

    return await createInitialProductSocialQueue(
      ctx,
      ownerId,
      args.productId,
      args.now,
    );
  },
});
