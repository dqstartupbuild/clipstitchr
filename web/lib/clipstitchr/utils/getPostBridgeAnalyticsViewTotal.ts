import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export function getPostBridgeAnalyticsViewTotal(
  analytics: PostBridgeAnalytics[],
) {
  return analytics.reduce((total, item) => total + item.view_count, 0);
}
