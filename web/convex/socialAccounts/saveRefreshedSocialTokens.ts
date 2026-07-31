import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const saveRefreshedSocialTokens = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    lockId: v.string(),
    accessTokenCiphertext: v.string(),
    accessTokenExpiresAt: v.optional(v.string()),
    refreshTokenCiphertext: v.optional(v.string()),
    refreshTokenExpiresAt: v.optional(v.string()),
    tokenEncryptionVersion: v.number(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const account = await ctx.db
      .query("socialAccounts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();

    if (!account || account.tokenRefreshLockId !== args.lockId) {
      throw new Error("The social token refresh lock is no longer active.");
    }

    await ctx.db.patch(account._id, {
      accessTokenCiphertext: args.accessTokenCiphertext,
      accessTokenExpiresAt: args.accessTokenExpiresAt,
      refreshTokenCiphertext:
        args.refreshTokenCiphertext ?? account.refreshTokenCiphertext,
      refreshTokenExpiresAt:
        args.refreshTokenExpiresAt ?? account.refreshTokenExpiresAt,
      tokenEncryptionVersion: args.tokenEncryptionVersion,
      tokenRefreshLockId: undefined,
      tokenRefreshLockedUntil: undefined,
      lastRefreshedAt: args.now,
      status:
        account.status === "needs_attention" ? "connected" : account.status,
      lastErrorCode: undefined,
      lastErrorMessage: undefined,
      updatedAt: args.now,
    });
  },
});
