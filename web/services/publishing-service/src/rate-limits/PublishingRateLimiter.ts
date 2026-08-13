import type { PublishingRateLimitDecision } from "./PublishingRateLimitDecision.js";
import type { PublishingRateLimitRequest } from "./PublishingRateLimitRequest.js";

export interface PublishingRateLimiter {
  consume(request: PublishingRateLimitRequest): Promise<PublishingRateLimitDecision>;
}
