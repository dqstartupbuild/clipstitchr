import type { PublishingRateLimitQuota } from "./PublishingRateLimitQuota.js";

export type PublishingRateLimitPolicy = Readonly<{
  global: PublishingRateLimitQuota;
  tenant: PublishingRateLimitQuota;
}>;
