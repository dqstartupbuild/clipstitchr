import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import { isSocialPublishingAccountAvailable } from "@/lib/clipstitchr/utils/isSocialPublishingAccountAvailable";

export function getSelectedSocialPublishingAccounts(
  accounts: SocialPublishingSocialAccount[],
  ids: string[],
) {
  const selectedIdSet = new Set(ids);
  const selectedAccounts = accounts.filter(
    (account) =>
      selectedIdSet.has(account.id) &&
      isSocialPublishingAccountAvailable(account),
  );

  if (!selectedAccounts.length || selectedAccounts.length !== selectedIdSet.size) {
    throw new Error("Choose active, connected accounts before scheduling.");
  }

  return selectedAccounts;
}
