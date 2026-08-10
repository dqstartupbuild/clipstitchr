import { isSocialPublishingPlatform } from "@/lib/clipstitchr/server/socialPublishing/isSocialPublishingPlatform";
import { listAllSocialPublishingPages } from "@/lib/clipstitchr/server/socialPublishing/listAllSocialPublishingPages";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

type ZernioAnalyticsMetrics = {
  comments?: number;
  lastUpdated?: string;
  likes?: number;
  shares?: number;
  videoDurationSeconds?: number | null;
  views?: number;
};

type ZernioAnalyticsPost = {
  _id: string;
  analytics?: ZernioAnalyticsMetrics;
  content?: string;
  latePostId?: string | null;
  platforms?: {
    accountId?: string;
    accountUsername?: string | null;
    analytics?: ZernioAnalyticsMetrics | null;
    platform?: string;
    platformPostId?: string | null;
    platformPostUrl?: string | null;
  }[];
  platform?: string;
  platformPostId?: string | null;
  platformPostUrl?: string | null;
  publishedAt?: string | null;
  scheduledFor?: string;
  thumbnailUrl?: string | null;
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

  const postId = post.latePostId || post._id;

  return {
    comment_count: metrics.comments ?? 0,
    cover_image_url: post.thumbnailUrl ?? null,
    duration: metrics.videoDurationSeconds ?? null,
    id: `${post._id}:${platform}:${accountId || platformPostId || "post"}`,
    last_synced_at:
      metrics.lastUpdated ?? post.publishedAt ?? post.scheduledFor ?? "",
    like_count: metrics.likes ?? 0,
    match_confidence: null,
    platform,
    platform_created_at: post.publishedAt ?? post.scheduledFor ?? null,
    platform_post_id: platformPostId ?? null,
    post_result_id: postId,
    share_count: metrics.shares ?? 0,
    share_url: platformPostUrl ?? null,
    video_description: post.content ?? "",
    view_count: metrics.views ?? 0,
  };
}

export async function listSocialPublishingAnalytics(
  apiKey: string,
  mappedPostIds: string[] = [],
) {
  const fromDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const posts = await listAllSocialPublishingPages<ZernioAnalyticsPost>({
    apiKey,
    pageSize: socialPublishingAnalyticsPageSize,
    path: "/v1/analytics",
    query: new URLSearchParams({ fromDate, source: "late" }),
  });
  const mappedPostIdSet = new Set(mappedPostIds);

  return posts.flatMap((post) => {
    const postId = post.latePostId || post._id;

    if (mappedPostIdSet.size > 0 && !mappedPostIdSet.has(postId)) {
      return [];
    }

    if (post.platforms?.length) {
      return post.platforms.flatMap((target) => {
        const row = createSocialPublishingAnalyticsRow(
          post,
          target.platform ?? "",
          target.accountId ?? "",
          target.analytics ?? post.analytics ?? {},
          target.platformPostId,
          target.platformPostUrl,
        );

        return row ? [row] : [];
      });
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
