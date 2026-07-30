import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertOwnerCanPublishSocial } from "../billing/assertOwnerCanPublishSocial";
import { assertProductBelongsToOwner } from "../assertProductBelongsToOwner";
import { rateLimiter } from "../rateLimiter";
import { enqueueSocialTargetProviderJob } from "../socialPublishing/enqueueSocialTargetProviderJob";

export const createSocialAnalyticsRefreshRun = mutation({
  args: {
    id: v.string(),
    productId: v.optional(v.string()),
    socialAccountId: v.optional(v.string()),
    rangeStart: v.optional(v.string()),
    rangeEnd: v.optional(v.string()),
    includeTikTokSaves: v.boolean(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const nowMs = Date.parse(args.now);
    const rangeStartMs = args.rangeStart
      ? Date.parse(args.rangeStart)
      : undefined;
    const rangeEndMs = args.rangeEnd ? Date.parse(args.rangeEnd) : undefined;

    if (
      !Number.isFinite(nowMs) ||
      (rangeStartMs !== undefined && !Number.isFinite(rangeStartMs)) ||
      (rangeEndMs !== undefined && !Number.isFinite(rangeEndMs)) ||
      (rangeStartMs !== undefined &&
        rangeEndMs !== undefined &&
        rangeStartMs > rangeEndMs)
    ) {
      throw new Error("Choose a valid analytics date range.");
    }

    await rateLimiter.limit(ctx, "socialAnalyticsRefresh", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "socialAnalyticsRefreshGlobal", {
      throws: true,
    });
    await assertOwnerCanPublishSocial(ctx, ownerId, args.now);
    await assertProductBelongsToOwner(ctx, ownerId, args.productId);

    const existingRun = await ctx.db
      .query("socialAnalyticsRefreshRuns")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (existingRun) {
      throw new Error("This analytics refresh was already created.");
    }

    if (args.socialAccountId) {
      const account = await ctx.db
        .query("socialAccounts")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", args.socialAccountId!),
        )
        .unique();

      if (!account) {
        throw new Error("Choose one of your connected social accounts.");
      }
    }

    const publications = await ctx.db
      .query("socialExternalPublications")
      .withIndex("by_owner_created", (index) => index.eq("ownerId", ownerId))
      .order("desc")
      .take(2_000);
    const candidatePublications = publications.filter((publication) => {
      const publishedMs = publication.publishedAt
        ? Date.parse(publication.publishedAt)
        : Number.NaN;

      return (
        publication.status === "published" &&
        Number.isFinite(publishedMs) &&
        (!args.socialAccountId ||
          publication.socialAccountId === args.socialAccountId) &&
        (rangeStartMs === undefined || publishedMs >= rangeStartMs) &&
        (rangeEndMs === undefined || publishedMs <= rangeEndMs)
      );
    });
    const postPairs = await Promise.all(
      Array.from(
        new Set(candidatePublications.map((publication) => publication.postId)),
      ).map(async (postId) => {
        const post = await ctx.db
          .query("socialPosts")
          .withIndex("by_owner_id", (index) =>
            index.eq("ownerId", ownerId).eq("id", postId),
          )
          .unique();

        return [postId, post] as const;
      }),
    );
    const postsById = new Map(postPairs);
    const eligiblePublications = candidatePublications.filter(
      (publication) =>
        postsById.has(publication.postId) &&
        (!args.productId ||
          postsById.get(publication.postId)?.productId === args.productId),
    );

    if (eligiblePublications.length === 0) {
      throw new Error("Publish a post before refreshing analytics.");
    }

    await ctx.db.insert("socialAnalyticsRefreshRuns", {
      ownerId,
      id: args.id,
      productId: args.productId,
      socialAccountId: args.socialAccountId,
      rangeStart: args.rangeStart,
      rangeEnd: args.rangeEnd,
      includeTikTokSaves: args.includeTikTokSaves,
      status: "queued",
      source: "manual",
      publicationIdsJson: JSON.stringify(
        eligiblePublications.map((publication) => publication.id),
      ),
      requestedPublicationCount: eligiblePublications.length,
      completedPublicationCount: 0,
      failedPublicationCount: 0,
      progress: 0,
      rateLimitDiagnosticsJson: JSON.stringify({
        checkedAt: args.now,
        globalBucket: "socialAnalyticsRefreshGlobal",
        ownerBucket: "socialAnalyticsRefresh",
      }),
      createdAt: args.now,
      updatedAt: args.now,
    });
    const jobId = `provider:social-analytics:${args.id}`;
    const job = await enqueueSocialTargetProviderJob(ctx, {
      idempotencyKey: `social-analytics:${args.id}`,
      inputSnapshotJson: JSON.stringify({ refreshRunId: args.id }),
      jobId,
      jobType: "social-analytics-refresh",
      now: args.now,
      ownerId,
    });
    const run = await ctx.db
      .query("socialAnalyticsRefreshRuns")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (run) {
      await ctx.db.patch(run._id, { providerJobId: job.id });
    }

    return {
      id: args.id,
      publicationCount: eligiblePublications.length,
    };
  },
});
