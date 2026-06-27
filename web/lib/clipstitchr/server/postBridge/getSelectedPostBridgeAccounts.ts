import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

export function getSelectedPostBridgeAccounts(
  accounts: PostBridgeSocialAccount[],
  ids: number[],
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
