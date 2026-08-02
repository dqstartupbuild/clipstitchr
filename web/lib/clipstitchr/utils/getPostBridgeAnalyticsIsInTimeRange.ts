import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";
import type { PostBridgeAnalyticsTimeRange } from "@/lib/clipstitchr/types/PostBridgeAnalyticsTimeRange";
import { getPostBridgeAnalyticsCreatedAtMs } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsCreatedAtMs";
import { getPostBridgeAnalyticsTimeRangeCutoffMs } from "@/lib/clipstitchr/utils/getPostBridgeAnalyticsTimeRangeCutoffMs";

export function getPostBridgeAnalyticsIsInTimeRange(
  item: PostBridgeAnalytics,
  timeRange: PostBridgeAnalyticsTimeRange,
  nowMs = Date.now(),
) {
  const cutoffMs = getPostBridgeAnalyticsTimeRangeCutoffMs(timeRange, nowMs);

  if (cutoffMs === null) {
    return true;
  }

  const createdAtMs = getPostBridgeAnalyticsCreatedAtMs(item);

  return createdAtMs !== null && createdAtMs >= cutoffMs && createdAtMs <= nowMs;
}
