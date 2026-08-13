export type CreatePublishingIntegrationSettingsInput = Readonly<{
  existingValue: string | null;
  grantedScopes?: readonly string[];
  refreshTokenExpiresAt?: Date | null;
}>;
