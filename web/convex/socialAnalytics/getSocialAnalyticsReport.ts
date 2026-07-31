import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { socialAnalyticsViewValidator } from "../validators/socialAnalyticsView";
import {
  SOCIAL_ANALYTICS_METRIC_NAMES,
  type SocialAnalyticsMetricName,
} from "../../lib/clipstitchr/social/analytics/SocialAnalyticsMetricName";
import { createSocialAnalyticsRollups } from "../../lib/clipstitchr/social/analytics/createSocialAnalyticsRollups";
import { getLatestSocialAnalyticsMetricSet } from "../../lib/clipstitchr/social/analytics/getLatestSocialAnalyticsMetricSet";
import { getSocialAnalyticsGrowthMetricSet } from "../../lib/clipstitchr/social/analytics/getSocialAnalyticsGrowthMetricSet";
import { sumSocialAnalyticsMetricValues } from "../../lib/clipstitchr/social/analytics/sumSocialAnalyticsMetricValues";

export const getSocialAnalyticsReport = query({
  args: {
    view: socialAnalyticsViewValidator,
    rangeStart: v.string(),
    rangeEnd: v.string(),
    productId: v.optional(v.string()),
    socialAccountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const rangeStartMs = Date.parse(args.rangeStart);
    const rangeEndMs = Date.parse(args.rangeEnd);

    if (
      !Number.isFinite(rangeStartMs) ||
      !Number.isFinite(rangeEndMs) ||
      rangeStartMs > rangeEndMs
    ) {
      throw new Error("Choose a valid analytics date range.");
    }

    const [publications, snapshots, accounts, products, refreshRuns] =
      await Promise.all([
        ctx.db
          .query("socialExternalPublications")
          .withIndex("by_owner_created", (index) =>
            index.eq("ownerId", ownerId),
          )
          .order("desc")
          .take(2_000),
        ctx.db
          .query("socialAnalyticsSnapshots")
          .withIndex("by_owner_captured", (index) =>
            index.eq("ownerId", ownerId),
          )
          .order("desc")
          .take(10_000),
        ctx.db
          .query("socialAccounts")
          .withIndex("by_owner", (index) => index.eq("ownerId", ownerId))
          .collect(),
        ctx.db
          .query("products")
          .withIndex("by_owner_created", (index) =>
            index.eq("ownerId", ownerId),
          )
          .take(100),
        ctx.db
          .query("socialAnalyticsRefreshRuns")
          .withIndex("by_owner_created", (index) =>
            index.eq("ownerId", ownerId),
          )
          .order("desc")
          .take(10),
      ]);
    const posts = await Promise.all(
      Array.from(new Set(publications.map((publication) => publication.postId))).map(
        (postId) =>
          ctx.db
            .query("socialPosts")
            .withIndex("by_owner_id", (index) =>
              index.eq("ownerId", ownerId).eq("id", postId),
            )
            .unique(),
      ),
    );
    const postsById = new Map(
      posts
        .filter((post) => post !== null)
        .map((post) => [post!.id, post!] as const),
    );
    const snapshotsByPublication = new Map<
      string,
      typeof snapshots
    >();

    for (const snapshot of snapshots) {
      const current = snapshotsByPublication.get(snapshot.publicationId) ?? [];
      current.push(snapshot);
      snapshotsByPublication.set(snapshot.publicationId, current);
    }

    const accountsById = new Map(
      accounts.map((account) => [account.id, account]),
    );
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    const selected = publications.filter((publication) => {
      const post = postsById.get(publication.postId);
      const publishedMs = publication.publishedAt
        ? Date.parse(publication.publishedAt)
        : Number.NaN;

      return (
        publication.status === "published" &&
        Boolean(post) &&
        (!args.productId || post?.productId === args.productId) &&
        (!args.socialAccountId ||
          publication.socialAccountId === args.socialAccountId) &&
        (args.view === "growth_during_period" ||
          (Number.isFinite(publishedMs) &&
            publishedMs >= rangeStartMs &&
            publishedMs <= rangeEndMs))
      );
    });
    const reportPublications = selected.map((publication) => {
      const post = postsById.get(publication.postId)!;
      const account = accountsById.get(publication.socialAccountId);
      const product = productsById.get(post.productId);
      const publicationSnapshots =
        snapshotsByPublication.get(publication.id) ?? [];
      const current = getLatestSocialAnalyticsMetricSet({
        platform: publication.platform,
        snapshots: publicationSnapshots,
        ...(args.view === "growth_during_period"
          ? { capturedAtOrBefore: args.rangeEnd }
          : {}),
      });
      const growth = getSocialAnalyticsGrowthMetricSet({
        platform: publication.platform,
        snapshots: publicationSnapshots,
        rangeStart: args.rangeStart,
        rangeEnd: args.rangeEnd,
      });
      const metricValues = Object.fromEntries(
        SOCIAL_ANALYTICS_METRIC_NAMES.map((metric) => [
          metric,
          args.view === "growth_during_period"
            ? growth[metric as SocialAnalyticsMetricName].value
            : current[metric as SocialAnalyticsMetricName].value,
        ]),
      ) as Record<SocialAnalyticsMetricName, number | null>;

      return {
        id: publication.id,
        externalPublicationId: publication.externalPublicationId,
        permalink: publication.permalink,
        publishedAt: publication.publishedAt,
        platform: publication.platform,
        postId: post.id,
        postTitle: post.title,
        productId: post.productId,
        productName: product?.name ?? "Archived product",
        socialAccountId: publication.socialAccountId,
        accountName:
          account?.displayName || account?.username || "Disconnected account",
        metrics: metricValues,
        current,
        growth,
      };
    });
    const logicalPosts = createSocialAnalyticsRollups(
      reportPublications.map((publication) => ({
        groupId: publication.postId,
        groupLabel: publication.postTitle,
        metrics: publication.metrics,
      })),
    );
    const accountTotals = createSocialAnalyticsRollups(
      reportPublications.map((publication) => ({
        groupId: publication.socialAccountId,
        groupLabel: publication.accountName,
        metrics: publication.metrics,
      })),
    );
    const productTotals = createSocialAnalyticsRollups(
      reportPublications.map((publication) => ({
        groupId: publication.productId,
        groupLabel: publication.productName,
        metrics: publication.metrics,
      })),
    );

    return {
      view: args.view,
      rangeStart: args.rangeStart,
      rangeEnd: args.rangeEnd,
      publications: reportPublications,
      logicalPosts,
      accountTotals,
      productTotals,
      allProducts: {
        publicationCount: reportPublications.length,
        metrics: sumSocialAnalyticsMetricValues(
          reportPublications.map((publication) => publication.metrics),
        ),
      },
      combinesMultiplePlatforms:
        new Set(reportPublications.map((publication) => publication.platform))
          .size > 1,
      combinesMultipleAccounts:
        new Set(
          reportPublications.map(
            (publication) => publication.socialAccountId,
          ),
        ).size > 1,
      latestRefreshRun: refreshRuns[0]
        ? {
            id: refreshRuns[0].id,
            status: refreshRuns[0].status,
            progress: refreshRuns[0].progress,
            completedPublicationCount:
              refreshRuns[0].completedPublicationCount,
            failedPublicationCount: refreshRuns[0].failedPublicationCount,
            requestedPublicationCount:
              refreshRuns[0].requestedPublicationCount,
            errorMessage: refreshRuns[0].errorMessage,
            createdAt: refreshRuns[0].createdAt,
            completedAt: refreshRuns[0].completedAt,
          }
        : null,
    };
  },
});
