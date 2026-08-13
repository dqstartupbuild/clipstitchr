import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { rateLimiter } from "../rateLimiter";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioBetaR2ActiveProduct } from "./assertStudioBetaR2ActiveProduct";

export const consumeStudioBetaR2Download = mutation({
  args: { productId: v.string(), secret: v.string() },
  handler: async (ctx, { productId, secret }) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioBetaR2ActiveProduct(ctx, ownerId, productId);
    await rateLimiter.limit(ctx, "r2DownloadUrl", {
      key: ownerId,
      throws: true,
    });
  },
});
