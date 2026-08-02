import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

export const assertPublishingOptionalDate = (
  value: Date | null | undefined,
  field: string,
): void => {
  if (
    value !== null &&
    value !== undefined &&
    !Number.isFinite(value.getTime())
  ) {
    throw new PublishingPersistenceValidationError(field);
  }
};
