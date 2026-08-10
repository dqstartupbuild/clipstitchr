import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

export function getSelectedSocialPublishingAccounts(
  accounts: SocialPublishingSocialAccount[],
  ids: string[],
) {
  const selectedIdSet = new Set(ids);
  const selectedAccounts = accounts.filter((account) =>
    selectedIdSet.has(account.id),
  );

  if (!selectedAccounts.length || selectedAccounts.length !== selectedIdSet.size) {
    throw new Error("Choose connected accounts before scheduling.");
  }

  return selectedAccounts;
}
