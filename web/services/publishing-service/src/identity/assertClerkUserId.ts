import { InvalidPublishingTenantError } from "../errors/InvalidPublishingTenantError.js";

const CLERK_USER_ID_PATTERN = /^user_[A-Za-z0-9_-]{2,255}$/;

export const assertClerkUserId = (clerkUserId: string): void => {
  if (!CLERK_USER_ID_PATTERN.test(clerkUserId)) {
    throw new InvalidPublishingTenantError();
  }
};
