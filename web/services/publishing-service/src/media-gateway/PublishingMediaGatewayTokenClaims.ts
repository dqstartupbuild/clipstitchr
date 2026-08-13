import type { PublishingMediaGatewayProvider } from "./PublishingMediaGatewayProvider.js";

export type PublishingMediaGatewayTokenClaims = {
  audience: string;
  checksum?: string;
  contentType: string;
  etag?: string;
  expiresAtEpochMs: number;
  grantKey: string;
  issuedAtEpochMs: number;
  objectKey: string;
  provider: PublishingMediaGatewayProvider;
  quotaIdentity: string;
  schema: 1;
  sizeBytes: number;
  versionId?: string;
};
