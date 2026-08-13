export function createPersonalPublishingTenantKey(clerkUserId: string) {
  return `clerk-personal:${clerkUserId}`;
}
