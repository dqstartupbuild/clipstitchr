import type { SocialPublishingAnalyticsTimeRange } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsTimeRange";
import type { SocialPublishingDailyMetric } from "@/lib/clipstitchr/types/SocialPublishingDailyMetric";
import { getSocialPublishingAnalyticsTimeRangeCutoffMs } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsTimeRangeCutoffMs";

export function filterSocialPublishingDailyMetricsByTimeRange(
  metrics: SocialPublishingDailyMetric[],
  timeRange: SocialPublishingAnalyticsTimeRange,
  nowMs = Date.now(),
) {
  const cutoffMs = getSocialPublishingAnalyticsTimeRangeCutoffMs(
    timeRange,
    nowMs,
  );

  if (cutoffMs === null) {
    return metrics;
  }

  return metrics.filter((metric) => {
    const dateMs = Date.parse(metric.date);
    return Number.isFinite(dateMs) && dateMs >= cutoffMs;
  });
}
