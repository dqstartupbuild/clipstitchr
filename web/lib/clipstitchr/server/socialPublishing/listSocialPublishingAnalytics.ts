import { isSocialPublishingPlatform } from "@/lib/clipstitchr/server/socialPublishing/isSocialPublishingPlatform";
import { listAllSocialPublishingPages } from "@/lib/clipstitchr/server/socialPublishing/listAllSocialPublishingPages";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

type ZernioAnalyticsMetrics = {
  clicks?: number;
  comments?: number;
  engagementRate?: number;
  follows?: number;
  igReelsAvgWatchTime?: number;
  igReelsVideoViewTotalTime?: number;
  impressions?: number;
  lastUpdated?: string;
  likes?: number;
  reach?: number;
  saves?: number;
  shares?: number;
  videoDurationSeconds?: number | null;
  views?: number;
};

type ZernioAnalyticsPost = {
  _id?: string;
  analytics?: ZernioAnalyticsMetrics;
  content?: string;
  isExternal?: boolean;
  latePostId?: string | null;
  platformAnalytics?: ZernioAnalyticsTarget[];
  platforms?: {
    accountId?: string;
    accountUsername?: string | null;
    analytics?: ZernioAnalyticsMetrics | null;
    platform?: string;
    platformPostId?: string | null;
    platformPostUrl?: string | null;
  }[];
  platform?: string;
  postId?: string;
  platformPostId?: string | null;
  platformPostUrl?: string | null;
  publishedAt?: string | null;
  scheduledFor?: string;
  thumbnailUrl?: string | null;
};

type ZernioAnalyticsTarget = {
  accountId?: string;
  accountUsername?: string | null;
  analytics?: ZernioAnalyticsMetrics | null;
  platform?: string;
  platformPostId?: string | null;
  platformPostUrl?: string | null;
};

const socialPublishingAnalyticsPageSize = 100;

function createSocialPublishingAnalyticsRow(
  post: ZernioAnalyticsPost,
  platform: string,
  accountId: string,
  metrics: ZernioAnalyticsMetrics,
  platformPostId: string | null | undefined,
  platformPostUrl: string | null | undefined,
): SocialPublishingAnalytics | null {
  if (!isSocialPublishingPlatform(platform)) {
    return null;
  }

  const postId = post.latePostId || post.postId || post._id || platformPostId;

  if (!postId) {
    return null;
  }

  return {
    account_id: accountId || null,
    account_username: null,
    click_count: metrics.clicks ?? 0,
    comment_count: metrics.comments ?? 0,
    cover_image_url: post.thumbnailUrl ?? null,
    duration: metrics.videoDurationSeconds ?? null,
    engagement_rate: metrics.engagementRate ?? 0,
    follow_count: metrics.follows ?? 0,
    id: `${post.postId || post._id || postId}:${platform}:${accountId || platformPostId || "post"}`,
    impression_count: metrics.impressions ?? 0,
    is_external: Boolean(post.isExternal),
    last_synced_at:
      metrics.lastUpdated ?? post.publishedAt ?? post.scheduledFor ?? "",
    like_count: metrics.likes ?? 0,
    match_confidence: null,
    platform,
    platform_created_at: post.publishedAt ?? post.scheduledFor ?? null,
    platform_post_id: platformPostId ?? null,
    post_result_id: postId,
    reach_count: metrics.reach ?? 0,
    reels_average_watch_time: metrics.igReelsAvgWatchTime ?? null,
    reels_total_watch_time: metrics.igReelsVideoViewTotalTime ?? null,
    save_count: metrics.saves ?? 0,
    share_count: metrics.shares ?? 0,
    share_url: platformPostUrl ?? null,
    video_description: post.content ?? "",
    view_count: metrics.views ?? 0,
  };
}

export async function listSocialPublishingAnalytics(
  apiKey: string,
  accountIds: string[] = [],
) {
  const fromDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const posts = await listAllSocialPublishingPages<ZernioAnalyticsPost>({
    apiKey,
    pageSize: socialPublishingAnalyticsPageSize,
    path: "/v1/analytics",
    query: new URLSearchParams({ fromDate, source: "all" }),
  });
  const accountIdSet = new Set(accountIds);

  return posts.flatMap((post) => {
    const targets = post.platformAnalytics?.length
      ? post.platformAnalytics
      : post.platforms;

    if (targets?.length) {
      return targets.flatMap((target) => {
        if (
          accountIdSet.size > 0 &&
          (!target.accountId || !accountIdSet.has(target.accountId))
        ) {
          return [];
        }

        const row = createSocialPublishingAnalyticsRow(
          post,
          target.platform ?? "",
          target.accountId ?? "",
          target.analytics ?? post.analytics ?? {},
          target.platformPostId,
          target.platformPostUrl,
        );

        return row
          ? [{ ...row, account_username: target.accountUsername ?? null }]
          : [];
      });
    }

    if (accountIdSet.size > 0) {
      return [];
    }

    const row = createSocialPublishingAnalyticsRow(
      post,
      post.platform ?? "",
      "",
      post.analytics ?? {},
      post.platformPostId,
      post.platformPostUrl,
    );

    return row ? [row] : [];
  });
}
