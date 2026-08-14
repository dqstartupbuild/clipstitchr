import { isSocialPublishingAnalyticsAccountAvailable } from "@/lib/clipstitchr/server/socialPublishing/isSocialPublishingAnalyticsAccountAvailable";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

export function getSocialPublishingAnalyticsAccountIds(
  accounts: SocialPublishingSocialAccount[],
  configuredAccountIds?: string[],
) {
  const availableAccountIds = new Set(
    accounts
      .filter(isSocialPublishingAnalyticsAccountAvailable)
      .map((account) => account.id),
  );

  if (configuredAccountIds === undefined) {
    return [...availableAccountIds];
  }

  return [...new Set(configuredAccountIds)].filter((accountId) =>
    availableAccountIds.has(accountId),
  );
}
