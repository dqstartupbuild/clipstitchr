import { v } from "convex/values";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { clearSocialPublishingSocialAccountIdsForOwner } from "./clearSocialPublishingSocialAccountIdsForOwner";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const settings = await ctx.db
      .query("socialPublishingSettings")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();

    return {
      apiKeyLast4: settings?.apiKeyLast4,
      hasApiKey: Boolean(settings?.encryptedApiKey),
      lastVerifiedAt: settings?.lastVerifiedAt,
      updatedAt: settings?.updatedAt,
    };
  },
});

export const getSecret = query({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const settings = await ctx.db
      .query("socialPublishingSettings")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();

    return settings
      ? {
          encryptedApiKey: settings.encryptedApiKey,
        }
      : null;
  },
});

export const saveSecret = mutation({
  args: {
    apiKeyLast4: v.string(),
    clearLinkedAccountIds: v.boolean(),
    encryptedApiKey: v.string(),
    lastVerifiedAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      apiKeyLast4,
      clearLinkedAccountIds,
      encryptedApiKey,
      lastVerifiedAt,
      updatedAt,
    },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const settings = await ctx.db
      .query("socialPublishingSettings")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();

    if (settings && clearLinkedAccountIds) {
      await clearSocialPublishingSocialAccountIdsForOwner(ctx, ownerId, updatedAt);
    }

    if (settings) {
      await ctx.db.patch(settings._id, {
        apiKeyLast4,
        encryptedApiKey,
        lastVerifiedAt,
        updatedAt,
      });
      return settings._id;
    }

    return await ctx.db.insert("socialPublishingSettings", {
      apiKeyLast4,
      encryptedApiKey,
      lastVerifiedAt,
      ownerId,
      createdAt: updatedAt,
      updatedAt,
    });
  },
});

export const clearSecret = mutation({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const settings = await ctx.db
      .query("socialPublishingSettings")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();

    await clearSocialPublishingSocialAccountIdsForOwner(
      ctx,
      ownerId,
      new Date().toISOString(),
    );

    if (!settings) {
      return null;
    }

    await ctx.db.delete(settings._id);
    return settings._id;
  },
});
