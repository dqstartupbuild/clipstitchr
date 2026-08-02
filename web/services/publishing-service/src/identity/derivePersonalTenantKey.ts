import { assertClerkUserId } from "./assertClerkUserId.js";
import type { PublishingTenantKey } from "./PublishingTenantKey.js";

export const derivePersonalTenantKey = (
  clerkUserId: string,
): PublishingTenantKey => {
  assertClerkUserId(clerkUserId);
  return `clerk-personal:${clerkUserId}` as PublishingTenantKey;
};
