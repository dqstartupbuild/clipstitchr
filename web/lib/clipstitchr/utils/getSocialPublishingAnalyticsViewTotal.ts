import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

export function getSocialPublishingAnalyticsViewTotal(
  analytics: SocialPublishingAnalytics[],
) {
  return analytics.reduce((total, item) => total + item.view_count, 0);
}
