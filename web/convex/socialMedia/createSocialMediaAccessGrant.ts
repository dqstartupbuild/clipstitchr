import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { rateLimiter } from "../rateLimiter";
import { assertSocialAssetObjectKeyBelongsToOwner } from "../social/assertSocialAssetObjectKeyBelongsToOwner";

export const createSocialMediaAccessGrant = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    targetId: v.string(),
    objectKey: v.string(),
    tokenHash: v.string(),
    expiresAt: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);
    assertSocialAssetObjectKeyBelongsToOwner(args.objectKey, args.ownerId);
    await rateLimiter.limit(ctx, "socialMediaGrantCreate", {
      key: args.ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "socialMediaGrantCreateGlobal", {
      throws: true,
    });

    const target = await ctx.db
      .query("socialPostTargets")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.targetId),
      )
      .unique();

    if (!target) {
      throw new Error("Social media target not found.");
    }

    const assets = await ctx.db
      .query("socialPostAssets")
      .withIndex("by_owner_post", (index) =>
        index.eq("ownerId", args.ownerId).eq("postId", target.postId),
      )
      .collect();

    if (!assets.some((asset) => asset.objectKey === args.objectKey)) {
      throw new Error("This file is not part of the social post.");
    }

    const existing = await ctx.db
      .query("socialMediaAccessGrants")
      .withIndex("by_token_hash", (index) =>
        index.eq("tokenHash", args.tokenHash),
      )
      .unique();

    if (existing) {
      return existing.id;
    }

    await ctx.db.insert("socialMediaAccessGrants", {
      ownerId: args.ownerId,
      id: args.id,
      targetId: args.targetId,
      objectKey: args.objectKey,
      tokenHash: args.tokenHash,
      expiresAt: args.expiresAt,
      createdAt: args.now,
    });

    return args.id;
  },
});
