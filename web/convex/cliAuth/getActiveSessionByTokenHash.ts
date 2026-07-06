import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { query } from "../_generated/server";

export const getActiveSessionByTokenHash = query({
  args: {
    checkedAt: v.string(),
    secret: v.string(),
    tokenHash: v.string(),
  },
  handler: async (ctx, { checkedAt, secret, tokenHash }) => {
    assertRateLimitApiSecret(secret);

    const session = await ctx.db
      .query("cliSessions")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();

    if (!session || session.revokedAt || session.expiresAt <= checkedAt) {
      return null;
    }

    return {
      clientName: session.clientName,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      id: session.id,
      machineName: session.machineName,
      ownerId: session.ownerId,
    };
  },
});
