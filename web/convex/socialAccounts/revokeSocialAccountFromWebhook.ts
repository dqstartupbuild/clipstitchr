import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { socialPlatformValidator } from "../validators/socialPlatform";
import { detachSocialAccountDefaults } from "./detachSocialAccountDefaults";
import { holdFutureTargetsForSocialAccount } from "./holdFutureTargetsForSocialAccount";
import { createNotification } from "../createNotification";

export const revokeSocialAccountFromWebhook = mutation({
  args: {
    secret: v.string(),
    platform: socialPlatformValidator,
    externalAccountId: v.string(),
    redactedAccessTokenCiphertext: v.string(),
    tokenEncryptionVersion: v.number(),
    reason: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);

    const accounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_platform_external", (index) =>
        index
          .eq("platform", args.platform)
          .eq("externalAccountId", args.externalAccountId),
      )
      .collect();

    for (const account of accounts) {
      await ctx.db.patch(account._id, {
        status: "revoked",
        accessTokenCiphertext: args.redactedAccessTokenCiphertext,
        accessTokenExpiresAt: undefined,
        refreshTokenCiphertext: undefined,
        refreshTokenExpiresAt: undefined,
        tokenEncryptionVersion: args.tokenEncryptionVersion,
        revokedAt: args.now,
        lastErrorCode: "authorization_removed",
        lastErrorMessage: args.reason,
        tokenRefreshLockId: undefined,
        tokenRefreshLockedUntil: undefined,
        updatedAt: args.now,
      });
      await detachSocialAccountDefaults(ctx, account.ownerId, account.id);
      await holdFutureTargetsForSocialAccount(ctx, {
        accountId: account.id,
        now: args.now,
        ownerId: account.ownerId,
        reason: "Reconnect this account, then review and resume the post.",
      });
      await createNotification(ctx, {
        ownerId: account.ownerId,
        sourceType: "social-post",
        sourceId: account.id,
        dedupeKey: `social-account-revoked:${account.id}:${args.now.slice(0, 10)}`,
        title: `Reconnect ${args.platform === "tiktok" ? "TikTok" : "Instagram"}`,
        preview: "Scheduled posts for this account are on hold.",
        message:
          "Reconnect the account, then review each held post before resuming it.",
        createdAt: args.now,
      });
    }

    return accounts.map((account) => account.ownerId);
  },
});
