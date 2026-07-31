import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { socialPlatformValidator } from "../validators/socialPlatform";
import { detachSocialAccountDefaults } from "./detachSocialAccountDefaults";
import { holdFutureTargetsForSocialAccount } from "./holdFutureTargetsForSocialAccount";

export const revokeSocialAccountFromProvider = mutation({
  args: {
    secret: v.string(),
    platform: socialPlatformValidator,
    externalAccountId: v.string(),
    now: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const account = await ctx.db
      .query("socialAccounts")
      .withIndex("by_platform_external", (index) =>
        index
          .eq("platform", args.platform)
          .eq("externalAccountId", args.externalAccountId),
      )
      .unique();

    if (!account) {
      return null;
    }

    await ctx.db.patch(account._id, {
      status: "revoked",
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

    return account.ownerId;
  },
});
