import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";
import { getSocialPublishingAnalyticsCreatedAtMs } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsCreatedAtMs";

export function sortSocialPublishingAnalyticsNewestFirst(
  analytics: SocialPublishingAnalytics[],
) {
  return [...analytics].sort((left, right) => {
    const leftTime = getSocialPublishingAnalyticsCreatedAtMs(left);
    const rightTime = getSocialPublishingAnalyticsCreatedAtMs(right);

    if (leftTime === null) {
      return rightTime === null ? 0 : 1;
    }

    return rightTime === null ? -1 : rightTime - leftTime;
  });
}
