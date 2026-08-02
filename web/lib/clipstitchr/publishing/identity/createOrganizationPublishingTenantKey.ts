export function createOrganizationPublishingTenantKey(
  clerkOrganizationId: string,
) {
  return `clerk-organization:${clerkOrganizationId}`;
}
