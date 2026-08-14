import { getSocialPublishingAnalyticsFreshness } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAnalyticsFreshness";
import { getSocialPublishingAnalyticsQueryScopes } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAnalyticsQueryScopes";
import { listSocialPublishingAnalytics } from "@/lib/clipstitchr/server/socialPublishing/listSocialPublishingAnalytics";
import { loadSocialPublishingAnalyticsInsights } from "@/lib/clipstitchr/server/socialPublishing/loadSocialPublishingAnalyticsInsights";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

type LoadSocialPublishingAnalyticsDashboardOptions = {
  accountIds: string[];
  accounts: SocialPublishingSocialAccount[];
  apiKey: string;
  externalSyncFailedAccountCount?: number;
};

export async function loadSocialPublishingAnalyticsDashboard({
  accountIds,
  accounts,
  apiKey,
  externalSyncFailedAccountCount = 0,
}: LoadSocialPublishingAnalyticsDashboardOptions) {
  const scopes = getSocialPublishingAnalyticsQueryScopes(accounts, accountIds);
  const [analytics, insights] = await Promise.all([
    listSocialPublishingAnalytics(apiKey, accountIds),
    loadSocialPublishingAnalyticsInsights(apiKey, accountIds, scopes),
  ]);

  return {
    accountCount: accountIds.length,
    analytics,
    externalSyncFailedAccountCount,
    ...insights,
    ...getSocialPublishingAnalyticsFreshness(analytics),
  };
}
