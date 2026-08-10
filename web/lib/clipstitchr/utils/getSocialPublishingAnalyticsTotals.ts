import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

export type SocialPublishingAnalyticsTotals = {
  comments: number;
  likes: number;
  shares: number;
  views: number;
};

export function getSocialPublishingAnalyticsTotals(
  analytics: SocialPublishingAnalytics[],
): SocialPublishingAnalyticsTotals {
  return analytics.reduce<SocialPublishingAnalyticsTotals>(
    (totals, item) => ({
      comments: totals.comments + item.comment_count,
      likes: totals.likes + item.like_count,
      shares: totals.shares + item.share_count,
      views: totals.views + item.view_count,
    }),
    {
      comments: 0,
      likes: 0,
      shares: 0,
      views: 0,
    },
  );
}
