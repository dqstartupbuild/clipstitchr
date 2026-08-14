import type { SocialPublishingAnalyticsLoadResult } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsLoadResult";

export function createEmptySocialPublishingAnalyticsLoadResult(): SocialPublishingAnalyticsLoadResult {
  return {
    accountCount: 0,
    analytics: [],
    bestTimes: [],
    contentDecay: [],
    dailyMetrics: [],
    externalSyncFailedAccountCount: 0,
    followerStats: { accounts: [], historyByAccountId: {} },
    lastSyncedAt: null,
    postingFrequency: [],
    stale: false,
    unavailableInsights: [],
  };
}
