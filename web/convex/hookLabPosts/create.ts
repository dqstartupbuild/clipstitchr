import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";
import { hookLabPostPlatformValidator } from "../validators/hookLabPostPlatform";

export const create = mutation({
  args: {
    canonicalUrl: v.string(),
    createdAt: v.string(),
    id: v.string(),
    platform: hookLabPostPlatformValidator,
    requestKey: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const requestKey = args.requestKey.trim().slice(0, 220);
    const existingRequest = await ctx.db
      .query("hookLabPosts")
      .withIndex("by_owner_request_key", (query) =>
        query.eq("ownerId", ownerId).eq("requestKey", requestKey),
      )
      .unique();

    if (existingRequest) {
      return existingRequest;
    }

    const canonicalUrl = args.canonicalUrl.trim();
    const existingPost = await ctx.db
      .query("hookLabPosts")
      .withIndex("by_owner_canonical_url", (query) =>
        query.eq("ownerId", ownerId).eq("canonicalUrl", canonicalUrl),
      )
      .unique();

    if (existingPost) {
      return existingPost;
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    const post = {
      ownerId,
      id: args.id.trim(),
      platform: args.platform,
      canonicalUrl,
      metrics: {},
      status: "analyzing" as const,
      requestKey,
      createdAt: args.createdAt,
      updatedAt: args.createdAt,
    };

    await ctx.db.insert("hookLabPosts", post);
    return post;
  },
});
