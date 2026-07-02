import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";
import type { ContentAnalyticsSourceFilter } from "@/lib/clipstitchr/types/ContentAnalyticsSourceFilter";

export function filterContentAnalyticsBySource(
  analytics: ContentAnalytics[],
  source: ContentAnalyticsSourceFilter,
) {
  if (source === "all") {
    return analytics;
  }

  return analytics.filter((item) => item.analytics_source === source);
}
