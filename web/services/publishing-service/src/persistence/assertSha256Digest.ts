import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

const SHA_256_PATTERN = /^[a-f0-9]{64}$/u;

export const assertSha256Digest = (value: string, field: string): void => {
  if (!SHA_256_PATTERN.test(value)) {
    throw new PublishingPersistenceValidationError(field);
  }
};
