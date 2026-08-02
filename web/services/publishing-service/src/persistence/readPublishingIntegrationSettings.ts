import type { PublishingIntegrationSettings } from "./PublishingIntegrationSettings.js";

const EMPTY_SETTINGS: PublishingIntegrationSettings = Object.freeze({
  schemaVersion: 1,
  grantedScopes: Object.freeze([]),
  refreshCredentialExpiresAt: null,
});

export const readPublishingIntegrationSettings = (
  value: string | null,
): PublishingIntegrationSettings => {
  if (value === null) {
    return EMPTY_SETTINGS;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      !("grantedScopes" in parsed) ||
      !Array.isArray(parsed.grantedScopes) ||
      !parsed.grantedScopes.every((scope) => typeof scope === "string") ||
      !("refreshCredentialExpiresAt" in parsed) ||
      (parsed.refreshCredentialExpiresAt !== null &&
        typeof parsed.refreshCredentialExpiresAt !== "string")
    ) {
      return EMPTY_SETTINGS;
    }

    return Object.freeze({
      schemaVersion: 1,
      grantedScopes: Object.freeze([...parsed.grantedScopes]),
      refreshCredentialExpiresAt: parsed.refreshCredentialExpiresAt,
    });
  } catch {
    return EMPTY_SETTINGS;
  }
};
