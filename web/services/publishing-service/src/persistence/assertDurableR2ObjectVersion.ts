import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

const OBJECT_VERSION_PATTERN = /^[^?#\u0000-\u001f\u007f]{1,1024}$/u;

export const assertDurableR2ObjectVersion = (objectVersion: string): void => {
  if (!OBJECT_VERSION_PATTERN.test(objectVersion)) {
    throw new PublishingPersistenceValidationError("objectVersion");
  }
};
