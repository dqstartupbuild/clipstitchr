import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const consumeCliPostBridgeSchedule = mutation({
  args: {
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { ownerId, secret }) => {
    assertRateLimitApiSecret(secret);

    await rateLimiter.limit(ctx, "postBridgeSchedule", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "postBridgeScheduleDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "postBridgeScheduleGlobalDaily", {
      throws: true,
    });
  },
});
