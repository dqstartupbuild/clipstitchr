import type { PublishingRateLimitAction } from "./PublishingRateLimitAction.js";
import type { PublishingRateLimitPolicy } from "./PublishingRateLimitPolicy.js";

export type PublishingRateLimitPolicies = Readonly<
  Record<PublishingRateLimitAction, PublishingRateLimitPolicy>
>;
