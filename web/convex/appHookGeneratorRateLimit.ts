import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { rateLimiter } from "./rateLimiter";

export const consume = mutation({
  args: {
    key: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { key, secret }) => {
    assertRateLimitApiSecret(secret);

    await rateLimiter.limit(ctx, "appHookGeneratorByClient", {
      key,
      throws: true,
    });
    await rateLimiter.limit(ctx, "appHookGeneratorGlobal", {
      throws: true,
    });
  },
});
