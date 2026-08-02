import { InvalidPublishingTenantError } from "../errors/InvalidPublishingTenantError.js";

const CLERK_ORGANIZATION_ID_PATTERN = /^org_[A-Za-z0-9_-]{2,255}$/;

export const assertClerkOrganizationId = (clerkOrganizationId: string): void => {
  if (!CLERK_ORGANIZATION_ID_PATTERN.test(clerkOrganizationId)) {
    throw new InvalidPublishingTenantError();
  }
};
