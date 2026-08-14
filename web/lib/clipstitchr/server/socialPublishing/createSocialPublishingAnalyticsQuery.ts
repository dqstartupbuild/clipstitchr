import type { SocialPublishingAnalyticsQueryScope } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsQueryScope";

export function createSocialPublishingAnalyticsQuery(
  scope: SocialPublishingAnalyticsQueryScope,
  values: Record<string, string> = {},
) {
  const query = new URLSearchParams({ source: "all", ...values });

  if (scope.accountId) {
    query.set("accountId", scope.accountId);
  } else if (scope.profileId) {
    query.set("profileId", scope.profileId);
  }

  return query;
}
