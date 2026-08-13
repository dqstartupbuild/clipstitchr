import type { PublishingTenantIdentity } from "@/lib/clipstitchr/publishing/identity/PublishingTenantIdentity";
import type { ResolvePublishingTenantIdentityInput } from "@/lib/clipstitchr/publishing/identity/ResolvePublishingTenantIdentityInput";
import { createOrganizationPublishingTenantKey } from "@/lib/clipstitchr/publishing/identity/createOrganizationPublishingTenantKey";
import { createPersonalPublishingTenantKey } from "@/lib/clipstitchr/publishing/identity/createPersonalPublishingTenantKey";

export function resolvePublishingTenantIdentity({
  clerkOrganizationId,
  clerkOrganizationRole,
  clerkUserId,
}: ResolvePublishingTenantIdentityInput): PublishingTenantIdentity | null {
  if (!clerkUserId) {
    return null;
  }

  if (clerkOrganizationId) {
    return {
      actorId: clerkUserId,
      clerkOrganizationId,
      clerkOrganizationRole: clerkOrganizationRole ?? null,
      clerkUserId,
      kind: "organization",
      tenantKey: createOrganizationPublishingTenantKey(clerkOrganizationId),
    };
  }

  return {
    actorId: clerkUserId,
    clerkOrganizationId: null,
    clerkOrganizationRole: null,
    clerkUserId,
    kind: "personal",
    tenantKey: createPersonalPublishingTenantKey(clerkUserId),
  };
}
