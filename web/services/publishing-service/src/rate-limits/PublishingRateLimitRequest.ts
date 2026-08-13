import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingRateLimitAction } from "./PublishingRateLimitAction.js";

export type PublishingRateLimitRequest = Readonly<{
  action: PublishingRateLimitAction;
  tenantKey: PublishingTenantKey;
  cost?: number;
}>;
