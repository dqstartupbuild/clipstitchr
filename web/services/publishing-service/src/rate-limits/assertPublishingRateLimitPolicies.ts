import { PublishingRateLimitConfigurationError } from "../errors/PublishingRateLimitConfigurationError.js";
import { PUBLISHING_RATE_LIMIT_ACTIONS } from "./PublishingRateLimitAction.js";
import type { PublishingRateLimitPolicies } from "./PublishingRateLimitPolicies.js";
import { assertPublishingRateLimitQuota } from "./assertPublishingRateLimitQuota.js";

export const assertPublishingRateLimitPolicies = (
  policies: PublishingRateLimitPolicies,
): void => {
  if (typeof policies !== "object" || policies === null) {
    throw new PublishingRateLimitConfigurationError();
  }

  for (const action of PUBLISHING_RATE_LIMIT_ACTIONS) {
    const policy = policies[action];

    if (typeof policy !== "object" || policy === null) {
      throw new PublishingRateLimitConfigurationError();
    }

    assertPublishingRateLimitQuota(policy.global);
    assertPublishingRateLimitQuota(policy.tenant);
  }
};
