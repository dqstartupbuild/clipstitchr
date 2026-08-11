import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import { isSocialPublishingAccountAvailable } from "@/lib/clipstitchr/utils/isSocialPublishingAccountAvailable";

export function getAvailableSocialPublishingAccountIds(
  accounts: SocialPublishingSocialAccount[],
  accountIds: string[],
) {
  const availableAccountIds = new Set(
    accounts
      .filter(isSocialPublishingAccountAvailable)
      .map((account) => account.id),
  );

  return [...new Set(accountIds)].filter((accountId) =>
    availableAccountIds.has(accountId),
  );
}
