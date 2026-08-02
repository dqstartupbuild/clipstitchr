export const PUBLISHING_RATE_LIMIT_ACTIONS = [
  "integration.read",
  "oauth.initiate",
  "oauth.callback",
  "integration.refresh",
  "integration.disconnect",
  "media.register",
  "media.fetch-url",
  "draft.write",
  "publish.create",
  "schedule.create",
  "publish.retry",
  "publish.cancel",
  "analytics.refresh",
  "status.poll",
  "webhook.process",
  "provider.paid-work",
] as const;

export type PublishingRateLimitAction =
  (typeof PUBLISHING_RATE_LIMIT_ACTIONS)[number];
