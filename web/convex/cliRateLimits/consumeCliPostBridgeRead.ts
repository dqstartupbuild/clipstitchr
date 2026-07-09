import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const consumeCliPostBridgeRead = mutation({
  args: {
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { ownerId, secret }) => {
    assertRateLimitApiSecret(secret);

    await rateLimiter.limit(ctx, "postBridgeRead", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "postBridgeReadGlobal", {
      throws: true,
    });
  },
});
