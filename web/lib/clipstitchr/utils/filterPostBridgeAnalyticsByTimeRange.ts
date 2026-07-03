import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import type { PostBridgeAnalyticsTimeRange } from "@/lib/clipstitchr/types/PostBridgeAnalyticsTimeRange";
import { getPostBridgeAnalyticsIsInTimeRange } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsIsInTimeRange";

export function filterPostBridgeAnalyticsByTimeRange(
  analytics: PostBridgeAnalytics[],
  timeRange: PostBridgeAnalyticsTimeRange,
  nowMs = Date.now(),
) {
  return analytics.filter((item) =>
    getPostBridgeAnalyticsIsInTimeRange(item, timeRange, nowMs),
  );
}
