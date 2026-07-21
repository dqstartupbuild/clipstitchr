import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { mutation } from "../_generated/server";
import { hookLabPostAnalysisValidator } from "../validators/hookLabPostAnalysis";
import { hookLabPostMetricsValidator } from "../validators/hookLabPostMetrics";
import { hookLabPostMediaKindValidator } from "../validators/hookLabPostMediaKind";
import { r2ObjectValidator } from "../validators/r2Object";
import { commitUsageReservationForOwner } from "../usage/commitUsageReservation";

export const completeAnalysisFromProvider = mutation({
  args: {
    analysis: hookLabPostAnalysisValidator,
    analysisModel: v.string(),
    analysisVersion: v.string(),
    analyzedAt: v.string(),
    authorName: v.optional(v.string()),
    authorProfileUrl: v.optional(v.string()),
    authorUsername: v.optional(v.string()),
    canonicalUrl: v.string(),
    durationSeconds: v.number(),
    id: v.string(),
    metrics: hookLabPostMetricsValidator,
    mediaKind: hookLabPostMediaKindValidator,
    ownerId: v.string(),
    promptVersion: v.string(),
    providerDatasetId: v.optional(v.string()),
    providerPredictionId: v.string(),
    providerRunId: v.optional(v.string()),
    secret: v.string(),
    sourceCreatedAt: v.optional(v.string()),
    sourcePostId: v.optional(v.string()),
    sourceText: v.optional(v.string()),
    thumbnailObject: v.optional(r2ObjectValidator),
    usageReservationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);
    const post = await ctx.db
      .query("hookLabPosts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id.trim()),
      )
      .unique();

    if (!post) {
      throw new Error("Hook Lab post not found.");
    }

    await ctx.db.patch(post._id, {
      analysis: args.analysis,
      analysisModel: args.analysisModel.slice(0, 180),
      analysisVersion: args.analysisVersion.slice(0, 80),
      analyzedAt: args.analyzedAt,
      authorName: args.authorName?.slice(0, 180),
      authorProfileUrl: args.authorProfileUrl?.slice(0, 2048),
      authorUsername: args.authorUsername?.slice(0, 180),
      canonicalUrl: args.canonicalUrl.slice(0, 2048),
      durationSeconds: args.durationSeconds,
      failureCode: undefined,
      failureMessage: undefined,
      metrics: args.metrics,
      mediaKind: args.mediaKind,
      promptVersion: args.promptVersion.slice(0, 80),
      providerDatasetId: args.providerDatasetId?.slice(0, 180),
      providerPredictionId: args.providerPredictionId.slice(0, 180),
      providerRunId: args.providerRunId?.slice(0, 180),
      sourceCreatedAt: args.sourceCreatedAt,
      sourcePostId: args.sourcePostId?.slice(0, 180),
      sourceText: args.sourceText?.slice(0, 4000),
      status: "ready",
      thumbnailObject: args.thumbnailObject ?? post.thumbnailObject,
      updatedAt: args.analyzedAt,
    });

    if (args.usageReservationId) {
      await commitUsageReservationForOwner(
        ctx,
        args.ownerId,
        args.usageReservationId,
        args.analyzedAt,
        "worker",
        {
          domainId: post.id,
          domainKind: "analysis",
          operation: "hook_lab_analysis",
          reservationKind: "worker",
          resource: "creation_credit",
        },
      );
    }

    return post.id;
  },
});
