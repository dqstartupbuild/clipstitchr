import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";
import type { SocialPublishingPlatformAnalyticsSummary } from "@/lib/clipstitchr/types/SocialPublishingPlatformAnalyticsSummary";

export function getSocialPublishingPlatformAnalyticsSummaries(
  analytics: SocialPublishingAnalytics[],
) {
  const summaries = new Map<
    SocialPublishingAnalytics["platform"],
    SocialPublishingPlatformAnalyticsSummary & { engagementRateTotal: number }
  >();

  analytics.forEach((item) => {
    const existing = summaries.get(item.platform) ?? {
      comments: 0,
      engagementRate: 0,
      engagementRateTotal: 0,
      impressions: 0,
      likes: 0,
      platform: item.platform,
      postCount: 0,
      reach: 0,
      saves: 0,
      shares: 0,
      views: 0,
    };

    existing.comments += item.comment_count;
    existing.engagementRateTotal += item.engagement_rate;
    existing.impressions += item.impression_count;
    existing.likes += item.like_count;
    existing.postCount += 1;
    existing.reach += item.reach_count;
    existing.saves += item.save_count;
    existing.shares += item.share_count;
    existing.views += item.view_count;
    existing.engagementRate = existing.engagementRateTotal / existing.postCount;
    summaries.set(item.platform, existing);
  });

  return [...summaries.values()]
    .map((summary) => ({
      comments: summary.comments,
      engagementRate: summary.engagementRate,
      impressions: summary.impressions,
      likes: summary.likes,
      platform: summary.platform,
      postCount: summary.postCount,
      reach: summary.reach,
      saves: summary.saves,
      shares: summary.shares,
      views: summary.views,
    }))
    .sort((a, b) => b.views - a.views || b.reach - a.reach);
}
