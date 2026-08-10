import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";
import type { SocialPublishingAnalyticsTimeRange } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsTimeRange";
import { getSocialPublishingAnalyticsIsInTimeRange } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsIsInTimeRange";

export function filterSocialPublishingAnalyticsByTimeRange(
  analytics: SocialPublishingAnalytics[],
  timeRange: SocialPublishingAnalyticsTimeRange,
  nowMs = Date.now(),
) {
  return analytics.filter((item) =>
    getSocialPublishingAnalyticsIsInTimeRange(item, timeRange, nowMs),
  );
}
