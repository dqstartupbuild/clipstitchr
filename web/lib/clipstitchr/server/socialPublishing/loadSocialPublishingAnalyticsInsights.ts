import { loadSocialPublishingBestTimes } from "@/lib/clipstitchr/server/socialPublishing/loadSocialPublishingBestTimes";
import { loadSocialPublishingContentDecay } from "@/lib/clipstitchr/server/socialPublishing/loadSocialPublishingContentDecay";
import { loadSocialPublishingDailyMetrics } from "@/lib/clipstitchr/server/socialPublishing/loadSocialPublishingDailyMetrics";
import { loadSocialPublishingFollowerStats } from "@/lib/clipstitchr/server/socialPublishing/loadSocialPublishingFollowerStats";
import { loadSocialPublishingPostingFrequency } from "@/lib/clipstitchr/server/socialPublishing/loadSocialPublishingPostingFrequency";
import type { SocialPublishingAnalyticsInsights } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsInsights";
import type { SocialPublishingAnalyticsQueryScope } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsQueryScope";

export async function loadSocialPublishingAnalyticsInsights(
  apiKey: string,
  accountIds: string[],
  scopes: SocialPublishingAnalyticsQueryScope[],
): Promise<SocialPublishingAnalyticsInsights> {
  const results = await Promise.allSettled([
    loadSocialPublishingDailyMetrics(apiKey, scopes),
    loadSocialPublishingBestTimes(apiKey, scopes),
    loadSocialPublishingContentDecay(apiKey, scopes),
    loadSocialPublishingPostingFrequency(apiKey, scopes),
    loadSocialPublishingFollowerStats(apiKey, accountIds),
  ]);
  const unavailableInsightLabels = [
    "performance over time",
    "best times to post",
    "content lifespan",
    "posting cadence",
    "follower growth",
  ];

  return {
    dailyMetrics: results[0].status === "fulfilled" ? results[0].value : [],
    bestTimes: results[1].status === "fulfilled" ? results[1].value : [],
    contentDecay: results[2].status === "fulfilled" ? results[2].value : [],
    postingFrequency:
      results[3].status === "fulfilled" ? results[3].value : [],
    followerStats:
      results[4].status === "fulfilled"
        ? results[4].value
        : { accounts: [], historyByAccountId: {} },
    unavailableInsights: results.flatMap((result, index) =>
      result.status === "rejected" ? [unavailableInsightLabels[index]] : [],
    ),
  };
}
