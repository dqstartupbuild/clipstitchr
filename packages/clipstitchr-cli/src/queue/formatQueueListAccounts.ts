export function formatQueueListAccounts(accountIds: number[]) {
  return accountIds.length ? accountIds.join(",") : "default";
}
