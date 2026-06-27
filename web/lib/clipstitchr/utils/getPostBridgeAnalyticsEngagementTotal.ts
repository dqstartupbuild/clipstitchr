import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export function getPostBridgeAnalyticsEngagementTotal(
  analytics: PostBridgeAnalytics[],
) {
  return analytics.reduce(
    (total, item) =>
      total + item.like_count + item.comment_count + item.share_count,
    0,
  );
}
