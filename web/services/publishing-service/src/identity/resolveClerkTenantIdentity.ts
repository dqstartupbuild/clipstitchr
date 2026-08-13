import type { ClerkTenantIdentity } from "./ClerkTenantIdentity.js";
import type { ClerkTenantIdentityInput } from "./ClerkTenantIdentityInput.js";
import { assertClerkUserId } from "./assertClerkUserId.js";
import { deriveOrganizationTenantKey } from "./deriveOrganizationTenantKey.js";
import { derivePersonalTenantKey } from "./derivePersonalTenantKey.js";

export const resolveClerkTenantIdentity = (
  input: ClerkTenantIdentityInput,
): ClerkTenantIdentity => {
  assertClerkUserId(input.actorUserId);

  if (input.activeOrganizationId !== undefined && input.activeOrganizationId !== null) {
    return Object.freeze({
      kind: "organization",
      tenantKey: deriveOrganizationTenantKey(input.activeOrganizationId),
      actorUserId: input.actorUserId,
      organizationId: input.activeOrganizationId,
    });
  }

  return Object.freeze({
    kind: "personal",
    tenantKey: derivePersonalTenantKey(input.actorUserId),
    actorUserId: input.actorUserId,
    organizationId: undefined,
  });
};
