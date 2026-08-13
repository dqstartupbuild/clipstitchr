import { ProviderRuntimeError } from "../provider-runtime/errors/ProviderRuntimeError.js";
import { normalizePublishingGrantedScopes } from "../persistence/normalizePublishingGrantedScopes.js";
import type { PublishingProvider } from "../providers/PublishingProvider.js";
import { hasExactObjectKeys } from "./hasExactObjectKeys.js";

const INTEGRATION_SETTINGS_KEYS = Object.freeze([
  "schemaVersion",
  "grantedScopes",
  "refreshCredentialExpiresAt",
]);

export const parsePublishingWorkflowGrantedScopes = (
  provider: PublishingProvider,
  value: string | null,
): readonly string[] => {
  let parsed: unknown;

  try {
    parsed = value === null ? null : JSON.parse(value);
  } catch {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed) ||
    !hasExactObjectKeys(
      parsed as Record<string, unknown>,
      INTEGRATION_SETTINGS_KEYS,
    )
  ) {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  const settings = parsed as Readonly<Record<string, unknown>>;
  const refreshExpiration = settings["refreshCredentialExpiresAt"];

  if (
    settings["schemaVersion"] !== 1 ||
    !Array.isArray(settings["grantedScopes"]) ||
    !settings["grantedScopes"].every((scope) => typeof scope === "string") ||
    (refreshExpiration !== null &&
      (typeof refreshExpiration !== "string" ||
        !Number.isSafeInteger(new Date(refreshExpiration).getTime())))
  ) {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }

  try {
    return normalizePublishingGrantedScopes(settings["grantedScopes"]);
  } catch {
    throw new ProviderRuntimeError(provider, "invalid_request");
  }
};
