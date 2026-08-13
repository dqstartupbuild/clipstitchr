import type { CreatePublishingIntegrationSettingsInput } from "./CreatePublishingIntegrationSettingsInput.js";
import { readPublishingIntegrationSettings } from "./readPublishingIntegrationSettings.js";

export const createPublishingIntegrationSettings = (
  input: CreatePublishingIntegrationSettingsInput,
): string => {
  const existing = readPublishingIntegrationSettings(input.existingValue);

  return JSON.stringify({
    schemaVersion: 1,
    grantedScopes: input.grantedScopes ?? existing.grantedScopes,
    refreshCredentialExpiresAt:
      input.refreshTokenExpiresAt === undefined
        ? existing.refreshCredentialExpiresAt
        : (input.refreshTokenExpiresAt?.toISOString() ?? null),
  });
};
