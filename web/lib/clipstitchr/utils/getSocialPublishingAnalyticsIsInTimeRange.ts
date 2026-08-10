import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";
import type { SocialPublishingAnalyticsTimeRange } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsTimeRange";
import { getSocialPublishingAnalyticsCreatedAtMs } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsCreatedAtMs";
import { getSocialPublishingAnalyticsTimeRangeCutoffMs } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsTimeRangeCutoffMs";

export function getSocialPublishingAnalyticsIsInTimeRange(
  item: SocialPublishingAnalytics,
  timeRange: SocialPublishingAnalyticsTimeRange,
  nowMs = Date.now(),
) {
  const cutoffMs = getSocialPublishingAnalyticsTimeRangeCutoffMs(timeRange, nowMs);

  if (cutoffMs === null) {
    return true;
  }

  const createdAtMs = getSocialPublishingAnalyticsCreatedAtMs(item);

  return createdAtMs !== null && createdAtMs >= cutoffMs && createdAtMs <= nowMs;
}
