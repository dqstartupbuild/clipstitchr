import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export type PostBridgeAnalyticsTotals = {
  comments: number;
  likes: number;
  shares: number;
  views: number;
};

export function getPostBridgeAnalyticsTotals(
  analytics: PostBridgeAnalytics[],
): PostBridgeAnalyticsTotals {
  return analytics.reduce<PostBridgeAnalyticsTotals>(
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
