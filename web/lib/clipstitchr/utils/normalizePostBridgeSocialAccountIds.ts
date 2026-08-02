const POST_BRIDGE_SOCIAL_ACCOUNT_LIMIT = 25;

export function normalizePostBridgeSocialAccountIds(accountIds: number[]) {
  return [...new Set(accountIds)]
    .filter((accountId) => Number.isFinite(accountId) && accountId > 0)
    .slice(0, POST_BRIDGE_SOCIAL_ACCOUNT_LIMIT);
}
