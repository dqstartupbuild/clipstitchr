import { socialPublishingAnalyticsStaleThresholdMs } from "@/lib/clipstitchr/constants/socialPublishingAnalyticsStaleThresholdMs";
import { getLatestSocialPublishingAnalyticsSyncedAtMs } from "@/lib/clipstitchr/server/socialPublishing/getLatestSocialPublishingAnalyticsSyncedAtMs";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

export function getSocialPublishingAnalyticsFreshness(
  analytics: SocialPublishingAnalytics[],
  nowMs = Date.now(),
) {
  const lastSyncedAtMs =
    getLatestSocialPublishingAnalyticsSyncedAtMs(analytics);

  return {
    lastSyncedAt:
      lastSyncedAtMs === null
        ? null
        : new Date(lastSyncedAtMs).toISOString(),
    stale:
      analytics.length > 0 &&
      (lastSyncedAtMs === null ||
        nowMs - lastSyncedAtMs >
          socialPublishingAnalyticsStaleThresholdMs),
  };
}
