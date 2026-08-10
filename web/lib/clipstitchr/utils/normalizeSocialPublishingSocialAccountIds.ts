const SOCIAL_PUBLISHING_SOCIAL_ACCOUNT_LIMIT = 25;

export function normalizeSocialPublishingSocialAccountIds(accountIds: string[]) {
  return [...new Set(accountIds)]
    .map((accountId) => accountId.trim())
    .filter(Boolean)
    .slice(0, SOCIAL_PUBLISHING_SOCIAL_ACCOUNT_LIMIT);
}
