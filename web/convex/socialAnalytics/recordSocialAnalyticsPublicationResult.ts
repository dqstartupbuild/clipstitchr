import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { socialAnalyticsSnapshotInputValidator } from "../validators/socialAnalyticsSnapshotInput";

export const recordSocialAnalyticsPublicationResult = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    refreshRunId: v.string(),
    publicationId: v.string(),
    snapshots: v.array(socialAnalyticsSnapshotInputValidator),
    succeeded: v.boolean(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const [run, publication] = await Promise.all([
      ctx.db
        .query("socialAnalyticsRefreshRuns")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.refreshRunId),
        )
        .unique(),
      ctx.db
        .query("socialExternalPublications")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.publicationId),
        )
        .unique(),
    ]);

    if (!run || !publication) {
      throw new Error("Analytics refresh publication not found.");
    }

    const existing = await ctx.db
      .query("socialAnalyticsSnapshots")
      .withIndex("by_refresh_run", (index) =>
        index.eq("refreshRunId", args.refreshRunId),
      )
      .filter((query) =>
        query.eq(query.field("publicationId"), publication.id),
      )
      .collect();

    if (existing.length > 0) {
      return { alreadyRecorded: true, progress: run.progress };
    }

    const post = await ctx.db
      .query("socialPosts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", publication.postId),
      )
      .unique();

    if (!post) {
      throw new Error("Analytics refresh post not found.");
    }

    for (const snapshot of args.snapshots) {
      await ctx.db.insert("socialAnalyticsSnapshots", {
        ownerId: args.ownerId,
        productId: post.productId,
        postId: publication.postId,
        targetId: publication.targetId,
        publicationId: publication.id,
        socialAccountId: publication.socialAccountId,
        platform: publication.platform,
        capturedAt: args.now,
        refreshRunId: args.refreshRunId,
        createdAt: args.now,
        ...snapshot,
      });
    }

    const completedPublicationCount =
      run.completedPublicationCount + (args.succeeded ? 1 : 0);
    const failedPublicationCount =
      run.failedPublicationCount + (args.succeeded ? 0 : 1);
    const processed =
      completedPublicationCount + failedPublicationCount;
    const progress =
      run.requestedPublicationCount > 0
        ? Math.min(1, processed / run.requestedPublicationCount)
        : 1;

    await ctx.db.patch(run._id, {
      completedPublicationCount,
      failedPublicationCount,
      progress,
      updatedAt: args.now,
    });

    return { alreadyRecorded: false, progress };
  },
});
