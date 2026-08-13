import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:._/-]{0,511}$/u;

export const assertPublishingPersistenceIdentifier = (
  value: string,
  field: string,
): void => {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new PublishingPersistenceValidationError(field);
  }
};
