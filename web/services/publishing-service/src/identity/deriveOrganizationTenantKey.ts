import { assertClerkOrganizationId } from "./assertClerkOrganizationId.js";
import type { PublishingTenantKey } from "./PublishingTenantKey.js";

export const deriveOrganizationTenantKey = (
  clerkOrganizationId: string,
): PublishingTenantKey => {
  assertClerkOrganizationId(clerkOrganizationId);
  return `clerk-organization:${clerkOrganizationId}` as PublishingTenantKey;
};
