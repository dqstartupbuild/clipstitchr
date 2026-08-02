import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { deriveOrganizationTenantKey } from "../identity/deriveOrganizationTenantKey.js";
import { derivePersonalTenantKey } from "../identity/derivePersonalTenantKey.js";

export const parsePublishingWorkflowTenantKey = (
  value: string,
): PublishingTenantKey => {
  if (value.startsWith("clerk-personal:")) {
    try {
      return derivePersonalTenantKey(value.slice("clerk-personal:".length));
    } catch {
      throw new PublishingResourceOwnershipError();
    }
  }

  if (value.startsWith("clerk-organization:")) {
    try {
      return deriveOrganizationTenantKey(
        value.slice("clerk-organization:".length),
      );
    } catch {
      throw new PublishingResourceOwnershipError();
    }
  }

  throw new PublishingResourceOwnershipError();
};
