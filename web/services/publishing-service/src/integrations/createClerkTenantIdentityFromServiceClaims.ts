import type { ServiceAssertionClaims } from "../assertions/ServiceAssertionClaims.js";
import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import { resolveClerkTenantIdentity } from "../identity/resolveClerkTenantIdentity.js";

export const createClerkTenantIdentityFromServiceClaims = (
  claims: ServiceAssertionClaims,
): ClerkTenantIdentity =>
  resolveClerkTenantIdentity({
    actorUserId: claims.actorUserId,
    ...(claims.actorOrganizationId === undefined
      ? {}
      : { activeOrganizationId: claims.actorOrganizationId }),
  });
