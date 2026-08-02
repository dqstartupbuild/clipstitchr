import type { PrismaPublishingSafeIntegrationRecord } from "./PrismaPublishingSafeIntegrationRecord.js";

const PROACTIVE_REFRESH_WINDOW_MILLISECONDS = 300_000;

export const shouldProactivelyRefreshPublishingAccessToken = (
  integration: PrismaPublishingSafeIntegrationRecord,
  now: Date,
): boolean =>
  integration.refreshNeeded ||
  (integration.tokenExpiration !== null &&
    integration.tokenExpiration.getTime() <=
      now.getTime() + PROACTIVE_REFRESH_WINDOW_MILLISECONDS);
