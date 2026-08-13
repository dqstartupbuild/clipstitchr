import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

export const readPublishingListLimit = (limit: number | undefined): number => {
  const resolved = limit ?? 100;

  if (!Number.isInteger(resolved) || resolved < 1 || resolved > 100) {
    throw new PublishingPersistenceValidationError("listLimit");
  }

  return resolved;
};
