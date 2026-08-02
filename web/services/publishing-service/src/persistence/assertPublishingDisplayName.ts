import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

export const assertPublishingDisplayName = (
  value: string,
  field: string,
): void => {
  const normalized = value.trim();

  if (
    normalized.length < 1 ||
    normalized.length > 200 ||
    /[\u0000-\u001f\u007f]/u.test(normalized)
  ) {
    throw new PublishingPersistenceValidationError(field);
  }
};
