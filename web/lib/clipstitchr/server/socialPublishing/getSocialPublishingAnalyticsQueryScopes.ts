import { isSocialPublishingAnalyticsAccountAvailable } from "@/lib/clipstitchr/server/socialPublishing/isSocialPublishingAnalyticsAccountAvailable";
import type { SocialPublishingAnalyticsQueryScope } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsQueryScope";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

export function getSocialPublishingAnalyticsQueryScopes(
  accounts: SocialPublishingSocialAccount[],
  selectedAccountIds: string[],
): SocialPublishingAnalyticsQueryScope[] {
  const availableAccounts = accounts.filter(
    isSocialPublishingAnalyticsAccountAvailable,
  );
  const selectedAccountIdSet = new Set(selectedAccountIds);
  const accountsByProfile = new Map<string, SocialPublishingSocialAccount[]>();

  availableAccounts.forEach((account) => {
    accountsByProfile.set(account.profileId, [
      ...(accountsByProfile.get(account.profileId) ?? []),
      account,
    ]);
  });

  const scopes: SocialPublishingAnalyticsQueryScope[] = [];

  accountsByProfile.forEach((profileAccounts, profileId) => {
    const selectedProfileAccounts = profileAccounts.filter((account) =>
      selectedAccountIdSet.has(account.id),
    );

    if (!selectedProfileAccounts.length) {
      return;
    }

    if (selectedProfileAccounts.length === profileAccounts.length) {
      scopes.push({ profileId });
      return;
    }

    selectedProfileAccounts.forEach((account) => {
      scopes.push({ accountId: account.id });
    });
  });

  return scopes;
}
