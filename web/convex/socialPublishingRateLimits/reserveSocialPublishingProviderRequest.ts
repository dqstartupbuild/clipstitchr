import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const reserveSocialPublishingProviderRequest = mutation({
  args: {
    key: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { key, secret }) => {
    assertRateLimitApiSecret(secret);

    return await rateLimiter.limit(ctx, "socialPublishingProviderRequest", {
      key,
      reserve: true,
    });
  },
});
