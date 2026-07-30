import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { socialPlatformValidator } from "../validators/socialPlatform";
import { assertOwnerCanPublishSocial } from "../billing/assertOwnerCanPublishSocial";

export const upsertSocialAccountFromOAuth = mutation({
  args: {
    id: v.string(),
    platform: socialPlatformValidator,
    externalAccountId: v.string(),
    username: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    accountType: v.optional(v.string()),
    scopes: v.array(v.string()),
    accessTokenCiphertext: v.string(),
    accessTokenExpiresAt: v.optional(v.string()),
    refreshTokenCiphertext: v.optional(v.string()),
    refreshTokenExpiresAt: v.optional(v.string()),
    tokenEncryptionVersion: v.number(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await assertOwnerCanPublishSocial(ctx, ownerId, args.now);

    const existing = await ctx.db
      .query("socialAccounts")
      .withIndex("by_owner_platform_external", (index) =>
        index
          .eq("ownerId", ownerId)
          .eq("platform", args.platform)
          .eq("externalAccountId", args.externalAccountId),
      )
      .unique();
    const fields = {
      platform: args.platform,
      externalAccountId: args.externalAccountId,
      username: args.username,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
      accountType: args.accountType,
      status: "connected" as const,
      scopes: args.scopes,
      accessTokenCiphertext: args.accessTokenCiphertext,
      accessTokenExpiresAt: args.accessTokenExpiresAt,
      refreshTokenCiphertext: args.refreshTokenCiphertext,
      refreshTokenExpiresAt: args.refreshTokenExpiresAt,
      tokenEncryptionVersion: args.tokenEncryptionVersion,
      tokenRefreshLockId: undefined,
      tokenRefreshLockedUntil: undefined,
      lastErrorCode: undefined,
      lastErrorMessage: undefined,
      disconnectedAt: undefined,
      revokedAt: undefined,
      updatedAt: args.now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, fields);
      return existing.id;
    }

    await ctx.db.insert("socialAccounts", {
      ...fields,
      ownerId,
      id: args.id,
      createdAt: args.now,
    });

    return args.id;
  },
});
