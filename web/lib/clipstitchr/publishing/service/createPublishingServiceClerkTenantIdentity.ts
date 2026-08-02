import type { PublishingTenantIdentity } from "@/lib/clipstitchr/publishing/identity/PublishingTenantIdentity";
import type { ClerkTenantIdentity } from "@clipstitchr/publishing-service";

export function createPublishingServiceClerkTenantIdentity(
  identity: PublishingTenantIdentity,
): ClerkTenantIdentity {
  return {
    actorUserId: identity.clerkUserId,
    kind: identity.kind,
    organizationId: identity.clerkOrganizationId ?? undefined,
    tenantKey: identity.tenantKey as ClerkTenantIdentity["tenantKey"],
  };
}
