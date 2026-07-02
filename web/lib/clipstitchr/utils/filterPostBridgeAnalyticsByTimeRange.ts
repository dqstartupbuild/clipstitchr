import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import type { PostBridgeAnalyticsTimeRange } from "@/lib/clipstitchr/types/PostBridgeAnalyticsTimeRange";
import { getPostBridgeAnalyticsIsInTimeRange } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsIsInTimeRange";

export function filterPostBridgeAnalyticsByTimeRange<T extends PostBridgeAnalytics>(
  analytics: T[],
  timeRange: PostBridgeAnalyticsTimeRange,
  nowMs = Date.now(),
) {
  return analytics.filter((item) =>
    getPostBridgeAnalyticsIsInTimeRange(item, timeRange, nowMs),
  );
}
