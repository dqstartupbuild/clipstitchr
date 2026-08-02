import { PublishingRateLimitExceededError } from "../errors/PublishingRateLimitExceededError.js";
import type { PublishingRateLimitDecision } from "./PublishingRateLimitDecision.js";
import type { PublishingRateLimitRequest } from "./PublishingRateLimitRequest.js";
import type { PublishingRateLimiter } from "./PublishingRateLimiter.js";

export const enforcePublishingRateLimit = async (
  limiter: PublishingRateLimiter,
  request: PublishingRateLimitRequest,
): Promise<PublishingRateLimitDecision> => {
  const decision = await limiter.consume(request);

  if (!decision.allowed) {
    throw new PublishingRateLimitExceededError(
      decision.action,
      decision.retryAfterSeconds,
    );
  }

  return decision;
};
