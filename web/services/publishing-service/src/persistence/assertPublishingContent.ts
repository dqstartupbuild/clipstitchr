import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

export const assertPublishingContent = (content: string): void => {
  if (content.length > 100_000 || /[\u0000]/u.test(content)) {
    throw new PublishingPersistenceValidationError("content");
  }
};
