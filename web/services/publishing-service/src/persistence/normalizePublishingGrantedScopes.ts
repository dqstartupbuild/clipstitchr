import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

const SCOPE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:._/-]{0,199}$/u;

export const normalizePublishingGrantedScopes = (
  scopes: readonly string[],
): readonly string[] => {
  const normalized = [...new Set(scopes.map((scope) => scope.trim()))].sort();

  if (
    normalized.length > 100 ||
    normalized.some((scope) => !SCOPE_PATTERN.test(scope))
  ) {
    throw new PublishingPersistenceValidationError("grantedScopes");
  }

  return Object.freeze(normalized);
};
