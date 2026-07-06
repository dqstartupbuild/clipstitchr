import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { mutation } from "../_generated/server";

export const revokeSessionByTokenHash = mutation({
  args: {
    revokedAt: v.string(),
    secret: v.string(),
    tokenHash: v.string(),
  },
  handler: async (ctx, { revokedAt, secret, tokenHash }) => {
    assertRateLimitApiSecret(secret);

    const session = await ctx.db
      .query("cliSessions")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();

    if (!session || session.revokedAt) {
      return { revoked: false };
    }

    await ctx.db.patch(session._id, {
      revokedAt,
      updatedAt: revokedAt,
    });

    return { revoked: true };
  },
});
