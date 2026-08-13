import type { PublishingRateLimitAction } from "./PublishingRateLimitAction.js";
import type { PublishingRateLimitScopeDecision } from "./PublishingRateLimitScopeDecision.js";

export type PublishingRateLimitDecision = Readonly<{
  action: PublishingRateLimitAction;
  allowed: boolean;
  observedAtEpochMilliseconds: number;
  retryAfterSeconds: number;
  global: PublishingRateLimitScopeDecision;
  tenant: PublishingRateLimitScopeDecision;
}>;
