import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";

export const getSocialMediaAccessGrant = query({
  args: {
    secret: v.string(),
    tokenHash: v.string(),
    now: v.string(),
  },
  handler: async (ctx, { secret, tokenHash, now }) => {
    assertRateLimitApiSecret(secret);

    const grant = await ctx.db
      .query("socialMediaAccessGrants")
      .withIndex("by_token_hash", (index) => index.eq("tokenHash", tokenHash))
      .unique();

    if (
      !grant ||
      grant.revokedAt ||
      Date.parse(grant.expiresAt) <= Date.parse(now)
    ) {
      return null;
    }

    return {
      objectKey: grant.objectKey,
      ownerId: grant.ownerId,
    };
  },
});
