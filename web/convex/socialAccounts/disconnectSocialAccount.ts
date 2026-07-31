import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { detachSocialAccountDefaults } from "./detachSocialAccountDefaults";
import { holdFutureTargetsForSocialAccount } from "./holdFutureTargetsForSocialAccount";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";

export const disconnectSocialAccount = mutation({
  args: {
    secret: v.string(),
    id: v.string(),
    redactedAccessTokenCiphertext: v.string(),
    tokenEncryptionVersion: v.number(),
    now: v.string(),
  },
  handler: async (
    ctx,
    {
      secret,
      id,
      redactedAccessTokenCiphertext,
      tokenEncryptionVersion,
      now,
    },
  ) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const account = await ctx.db
      .query("socialAccounts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id),
      )
      .unique();

    if (!account) {
      throw new Error("Connected account not found.");
    }

    await ctx.db.patch(account._id, {
      status: "disconnected",
      accessTokenCiphertext: redactedAccessTokenCiphertext,
      accessTokenExpiresAt: undefined,
      refreshTokenCiphertext: undefined,
      refreshTokenExpiresAt: undefined,
      tokenEncryptionVersion,
      disconnectedAt: now,
      tokenRefreshLockId: undefined,
      tokenRefreshLockedUntil: undefined,
      updatedAt: now,
    });
    const [detachedDefaultCount, heldTargetCount] = await Promise.all([
      detachSocialAccountDefaults(ctx, ownerId, id),
      holdFutureTargetsForSocialAccount(ctx, {
        accountId: id,
        now,
        ownerId,
        reason: "Reconnect this account, then review and resume the post.",
      }),
    ]);

    return { detachedDefaultCount, heldTargetCount };
  },
});
