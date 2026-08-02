export type PublishingIntegrationSettings = Readonly<{
  schemaVersion: 1;
  grantedScopes: readonly string[];
  refreshCredentialExpiresAt: string | null;
}>;
