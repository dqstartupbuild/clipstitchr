import type { PublishingIntegrationRecord } from "./PublishingIntegrationRecord.js";

export type PublishingIntegrationRefreshCredentials = Readonly<{
  accessToken: string | null;
  integration: PublishingIntegrationRecord;
  refreshToken: string | null;
}>;
