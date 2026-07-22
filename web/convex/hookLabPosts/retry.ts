import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const retry = mutation({
  args: {
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const post = await ctx.db
      .query("hookLabPosts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!post) {
      throw new Error("Post not found.");
    }

    if (
      post.status !== "failed" &&
      post.status !== "needs_attention" &&
      post.status !== "ready"
    ) {
      throw new Error("This post is already being analyzed.");
    }

    const isReanalysis = post.status === "ready";
    const shouldRestartImport =
      post.failureCode === "social_import_failed" ||
      post.failureCode === "social_import_start_unconfirmed" ||
      post.failureCode === "source_video_unavailable";

    await ctx.db.patch(post._id, {
      analysis: isReanalysis ? post.analysis : undefined,
      analyzedAt: isReanalysis ? post.analyzedAt : undefined,
      failureCode: undefined,
      failureMessage: undefined,
      providerDatasetId: shouldRestartImport
        ? undefined
        : post.providerDatasetId,
      providerPredictionId: undefined,
      providerRunId: shouldRestartImport ? undefined : post.providerRunId,
      providerRunRequestedAt: shouldRestartImport
        ? undefined
        : post.providerRunRequestedAt,
      status: "analyzing",
      updatedAt,
    });

    return post.id;
  },
});
