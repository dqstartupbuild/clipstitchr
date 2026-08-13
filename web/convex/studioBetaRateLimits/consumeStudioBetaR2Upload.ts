import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { rateLimiter } from "../rateLimiter";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioBetaR2ActiveProduct } from "./assertStudioBetaR2ActiveProduct";

export const consumeStudioBetaR2Upload = mutation({
  args: {
    secret: v.string(),
    productId: v.string(),
    sizeBytes: v.number(),
  },
  handler: async (ctx, { productId, secret, sizeBytes }) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioBetaR2ActiveProduct(ctx, ownerId, productId);

    const uploadBytes = Math.ceil(sizeBytes);

    if (!Number.isFinite(uploadBytes) || uploadBytes <= 0) {
      throw new Error("Upload size must be positive.");
    }

    await rateLimiter.limit(ctx, "r2UploadUrl", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "r2UploadBytes", {
      key: ownerId,
      count: uploadBytes,
      throws: true,
    });
    await rateLimiter.limit(ctx, "r2UploadBytesMonthly", {
      key: ownerId,
      count: uploadBytes,
      throws: true,
    });
  },
});
