import { PUBLISHING_RATE_LIMIT_ACTIONS } from "./PublishingRateLimitAction.js";
import type { PublishingRateLimitPolicies } from "./PublishingRateLimitPolicies.js";

export const freezePublishingRateLimitPolicies = (
  policies: PublishingRateLimitPolicies,
): PublishingRateLimitPolicies =>
  Object.freeze(
    Object.fromEntries(
      PUBLISHING_RATE_LIMIT_ACTIONS.map((action) => [
        action,
        Object.freeze({
          global: Object.freeze({ ...policies[action].global }),
          tenant: Object.freeze({ ...policies[action].tenant }),
        }),
      ]),
    ) as Record<keyof PublishingRateLimitPolicies, PublishingRateLimitPolicies[keyof PublishingRateLimitPolicies]>,
  );
