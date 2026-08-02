import type { PostBridgeAnalyticsTimeRange } from "@/lib/clipstitchr/types/PostBridgeAnalyticsTimeRange";

const dayMs = 24 * 60 * 60 * 1000;

export function getPostBridgeAnalyticsTimeRangeCutoffMs(
  timeRange: PostBridgeAnalyticsTimeRange,
  nowMs = Date.now(),
) {
  if (timeRange === "all_time") {
    return null;
  }

  if (timeRange === "last_12_months") {
    const cutoffDate = new Date(nowMs);
    cutoffDate.setMonth(cutoffDate.getMonth() - 12);

    return cutoffDate.getTime();
  }

  const dayCountByRange: Record<
    Exclude<PostBridgeAnalyticsTimeRange, "all_time" | "last_12_months">,
    number
  > = {
    last_90_days: 90,
    last_30_days: 30,
    last_7_days: 7,
    last_24_hours: 1,
  };

  return nowMs - dayCountByRange[timeRange] * dayMs;
}
