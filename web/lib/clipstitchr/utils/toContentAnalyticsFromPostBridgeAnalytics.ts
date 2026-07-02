import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export function toContentAnalyticsFromPostBridgeAnalytics(
  item: PostBridgeAnalytics,
): ContentAnalytics {
  return {
    ...item,
    analytics_source: "post_bridge",
  };
}
