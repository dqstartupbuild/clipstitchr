import type { PublishingRateLimitPolicies } from "./PublishingRateLimitPolicies.js";

const ONE_MINUTE = 60_000;
const TEN_MINUTES = 600_000;
const ONE_HOUR = 3_600_000;

export const defaultPublishingRateLimitPolicies: PublishingRateLimitPolicies =
  Object.freeze({
    "integration.read": Object.freeze({
      tenant: Object.freeze({ limit: 120, windowMilliseconds: ONE_MINUTE }),
      global: Object.freeze({ limit: 10_000, windowMilliseconds: ONE_MINUTE }),
    }),
    "oauth.initiate": Object.freeze({
      tenant: Object.freeze({ limit: 10, windowMilliseconds: TEN_MINUTES }),
      global: Object.freeze({ limit: 1_000, windowMilliseconds: TEN_MINUTES }),
    }),
    "oauth.callback": Object.freeze({
      tenant: Object.freeze({ limit: 30, windowMilliseconds: TEN_MINUTES }),
      global: Object.freeze({ limit: 3_000, windowMilliseconds: TEN_MINUTES }),
    }),
    "integration.refresh": Object.freeze({
      tenant: Object.freeze({ limit: 30, windowMilliseconds: ONE_HOUR }),
      global: Object.freeze({ limit: 2_000, windowMilliseconds: ONE_HOUR }),
    }),
    "integration.disconnect": Object.freeze({
      tenant: Object.freeze({ limit: 10, windowMilliseconds: ONE_HOUR }),
      global: Object.freeze({ limit: 1_000, windowMilliseconds: ONE_HOUR }),
    }),
    "media.register": Object.freeze({
      tenant: Object.freeze({ limit: 60, windowMilliseconds: ONE_HOUR }),
      global: Object.freeze({ limit: 5_000, windowMilliseconds: ONE_HOUR }),
    }),
    "media.fetch-url": Object.freeze({
      tenant: Object.freeze({ limit: 240, windowMilliseconds: ONE_HOUR }),
      global: Object.freeze({ limit: 20_000, windowMilliseconds: ONE_HOUR }),
    }),
    "draft.write": Object.freeze({
      tenant: Object.freeze({ limit: 120, windowMilliseconds: ONE_HOUR }),
      global: Object.freeze({ limit: 10_000, windowMilliseconds: ONE_HOUR }),
    }),
    "publish.create": Object.freeze({
      tenant: Object.freeze({ limit: 20, windowMilliseconds: ONE_HOUR }),
      global: Object.freeze({ limit: 1_000, windowMilliseconds: ONE_HOUR }),
    }),
    "schedule.create": Object.freeze({
      tenant: Object.freeze({ limit: 100, windowMilliseconds: ONE_HOUR }),
      global: Object.freeze({ limit: 10_000, windowMilliseconds: ONE_HOUR }),
    }),
    "publish.retry": Object.freeze({
      tenant: Object.freeze({ limit: 30, windowMilliseconds: ONE_HOUR }),
      global: Object.freeze({ limit: 2_000, windowMilliseconds: ONE_HOUR }),
    }),
    "publish.cancel": Object.freeze({
      tenant: Object.freeze({ limit: 60, windowMilliseconds: ONE_HOUR }),
      global: Object.freeze({ limit: 5_000, windowMilliseconds: ONE_HOUR }),
    }),
    "analytics.refresh": Object.freeze({
      tenant: Object.freeze({ limit: 12, windowMilliseconds: ONE_HOUR }),
      global: Object.freeze({ limit: 200, windowMilliseconds: ONE_HOUR }),
    }),
    "status.poll": Object.freeze({
      tenant: Object.freeze({ limit: 600, windowMilliseconds: ONE_MINUTE }),
      global: Object.freeze({ limit: 10_000, windowMilliseconds: ONE_MINUTE }),
    }),
    "webhook.process": Object.freeze({
      tenant: Object.freeze({ limit: 120, windowMilliseconds: ONE_MINUTE }),
      global: Object.freeze({ limit: 5_000, windowMilliseconds: ONE_MINUTE }),
    }),
    "provider.paid-work": Object.freeze({
      tenant: Object.freeze({ limit: 20, windowMilliseconds: ONE_MINUTE }),
      global: Object.freeze({ limit: 500, windowMilliseconds: ONE_MINUTE }),
    }),
  });
