import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

const OBJECT_KEY_PATTERN =
  /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[^\\?#\u0000-\u001f\u007f]{1,1024}$/u;
const URI_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/iu;

export const assertDurableR2ObjectKey = (objectKey: string): void => {
  if (
    !OBJECT_KEY_PATTERN.test(objectKey) ||
    URI_SCHEME_PATTERN.test(objectKey)
  ) {
    throw new PublishingPersistenceValidationError("objectKey");
  }
};
