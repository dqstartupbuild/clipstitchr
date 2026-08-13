import { PublishingRateLimitConfigurationError } from "../errors/PublishingRateLimitConfigurationError.js";
import type { PublishingRateLimitQuota } from "./PublishingRateLimitQuota.js";

const MAX_RATE_LIMIT = 1_000_000;
const MAX_WINDOW_MILLISECONDS = 86_400_000;

export const assertPublishingRateLimitQuota = (
  quota: PublishingRateLimitQuota,
): void => {
  if (
    !Number.isSafeInteger(quota.limit) ||
    quota.limit < 1 ||
    quota.limit > MAX_RATE_LIMIT ||
    !Number.isSafeInteger(quota.windowMilliseconds) ||
    quota.windowMilliseconds < 1_000 ||
    quota.windowMilliseconds > MAX_WINDOW_MILLISECONDS
  ) {
    throw new PublishingRateLimitConfigurationError();
  }
};
