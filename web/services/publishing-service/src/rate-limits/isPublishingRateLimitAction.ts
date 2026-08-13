import {
  PUBLISHING_RATE_LIMIT_ACTIONS,
  type PublishingRateLimitAction,
} from "./PublishingRateLimitAction.js";

const PUBLISHING_RATE_LIMIT_ACTION_SET = new Set<string>(
  PUBLISHING_RATE_LIMIT_ACTIONS,
);

export const isPublishingRateLimitAction = (
  value: unknown,
): value is PublishingRateLimitAction =>
  typeof value === "string" && PUBLISHING_RATE_LIMIT_ACTION_SET.has(value);
