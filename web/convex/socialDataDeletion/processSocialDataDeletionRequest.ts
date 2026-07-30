import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { socialPlatformValidator } from "../validators/socialPlatform";
import { detachSocialAccountDefaults } from "../socialAccounts/detachSocialAccountDefaults";
import { holdFutureTargetsForSocialAccount } from "../socialAccounts/holdFutureTargetsForSocialAccount";

export const processSocialDataDeletionRequest = mutation({
  args: {
    secret: v.string(),
    id: v.string(),
    platform: socialPlatformValidator,
    externalAccountId: v.string(),
    confirmationCode: v.string(),
    redactedAccessTokenCiphertext: v.string(),
    tokenEncryptionVersion: v.number(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);

    const existingRequest = await ctx.db
      .query("socialDataDeletionRequests")
      .withIndex("by_confirmation_code", (index) =>
        index.eq("confirmationCode", args.confirmationCode),
      )
      .unique();

    if (existingRequest) {
      return existingRequest.status;
    }

    const accounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_platform_external", (index) =>
        index
          .eq("platform", args.platform)
          .eq("externalAccountId", args.externalAccountId),
      )
      .collect();
    const requestId = await ctx.db.insert("socialDataDeletionRequests", {
      ownerId: accounts.length === 1 ? accounts[0].ownerId : undefined,
      platform: args.platform,
      id: args.id,
      externalAccountId: args.externalAccountId,
      confirmationCode: args.confirmationCode,
      status: "processing",
      requestedAt: args.now,
      updatedAt: args.now,
    });

    for (const account of accounts) {
      const [targets, publications, snapshots, attempts] = await Promise.all([
        ctx.db
          .query("socialPostTargets")
          .withIndex("by_account_status", (index) =>
            index.eq("socialAccountId", account.id),
          )
          .collect(),
        ctx.db
          .query("socialExternalPublications")
          .withIndex("by_account_published", (index) =>
            index.eq("socialAccountId", account.id),
          )
          .collect(),
        ctx.db
          .query("socialAnalyticsSnapshots")
          .filter((query) =>
            query.eq(query.field("socialAccountId"), account.id),
          )
          .collect(),
        ctx.db
          .query("socialPublishAttempts")
          .filter((query) => query.eq(query.field("ownerId"), account.ownerId))
          .collect(),
      ]);

      await detachSocialAccountDefaults(ctx, account.ownerId, account.id);
      await holdFutureTargetsForSocialAccount(ctx, {
        accountId: account.id,
        now: args.now,
        ownerId: account.ownerId,
        reason: "This account asked us to delete its connection data.",
      });

      for (const target of targets) {
        await ctx.db.patch(target._id, {
          externalAccountIdSnapshot: "redacted",
          usernameSnapshot: "Deleted account",
          controlsJson: "{}",
          capabilitySnapshotJson: undefined,
          updatedAt: args.now,
        });
      }

      for (const publication of publications) {
        await ctx.db.delete(publication._id);
      }

      for (const snapshot of snapshots) {
        await ctx.db.delete(snapshot._id);
      }

      const targetIds = new Set(targets.map((target) => target.id));
      for (const attempt of attempts) {
        if (targetIds.has(attempt.targetId)) {
          await ctx.db.patch(attempt._id, {
            providerRequestId: undefined,
            providerPublishId: undefined,
            providerContainerId: undefined,
            providerResponseJson: undefined,
            errorMessage: undefined,
            updatedAt: args.now,
          });
        }
      }

      await ctx.db.patch(account._id, {
        status: "deletion_requested",
        username: "Deleted account",
        displayName: undefined,
        avatarUrl: undefined,
        externalAccountId: `deleted:${account.id}`,
        scopes: [],
        accessTokenCiphertext: args.redactedAccessTokenCiphertext,
        accessTokenExpiresAt: undefined,
        refreshTokenCiphertext: undefined,
        refreshTokenExpiresAt: undefined,
        tokenEncryptionVersion: args.tokenEncryptionVersion,
        capabilitySnapshotJson: undefined,
        capabilityCheckedAt: undefined,
        tokenRefreshLockId: undefined,
        tokenRefreshLockedUntil: undefined,
        updatedAt: args.now,
      });
    }

    await ctx.db.patch(requestId, {
      status: "completed",
      completedAt: args.now,
      updatedAt: args.now,
    });

    return "completed";
  },
});
