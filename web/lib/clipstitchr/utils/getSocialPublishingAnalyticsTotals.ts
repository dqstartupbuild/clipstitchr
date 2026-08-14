import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

export type SocialPublishingAnalyticsTotals = {
  averageEngagementRate: number;
  clicks: number;
  comments: number;
  follows: number;
  impressions: number;
  likes: number;
  reach: number;
  saves: number;
  shares: number;
  views: number;
};

export function getSocialPublishingAnalyticsTotals(
  analytics: SocialPublishingAnalytics[],
): SocialPublishingAnalyticsTotals {
  const totals = analytics.reduce<SocialPublishingAnalyticsTotals>(
    (totals, item) => ({
      averageEngagementRate:
        totals.averageEngagementRate + item.engagement_rate,
      clicks: totals.clicks + item.click_count,
      comments: totals.comments + item.comment_count,
      follows: totals.follows + item.follow_count,
      impressions: totals.impressions + item.impression_count,
      likes: totals.likes + item.like_count,
      reach: totals.reach + item.reach_count,
      saves: totals.saves + item.save_count,
      shares: totals.shares + item.share_count,
      views: totals.views + item.view_count,
    }),
    {
      averageEngagementRate: 0,
      clicks: 0,
      comments: 0,
      follows: 0,
      impressions: 0,
      likes: 0,
      reach: 0,
      saves: 0,
      shares: 0,
      views: 0,
    },
  );

  return {
    ...totals,
    averageEngagementRate: analytics.length
      ? totals.averageEngagementRate / analytics.length
      : 0,
  };
}
