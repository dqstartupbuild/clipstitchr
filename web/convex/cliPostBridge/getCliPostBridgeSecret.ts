import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { query } from "../_generated/server";

export const getCliPostBridgeSecret = query({
  args: {
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { ownerId, secret }) => {
    assertRateLimitApiSecret(secret);

    const settings = await ctx.db
      .query("postBridgeSettings")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();

    return settings
      ? {
          encryptedApiKey: settings.encryptedApiKey,
        }
      : null;
  },
});
