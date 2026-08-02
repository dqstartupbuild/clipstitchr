import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

const SENSITIVE_QUERY_KEY_PATTERN =
  /^(?:access_token|authorization|signature|sig|token|x-amz-.+)$/iu;

export const assertPublishingPictureUrl = (value: string): void => {
  if (value.length > 2_048) {
    throw new PublishingPersistenceValidationError("pictureUrl");
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" ||
      url.username.length > 0 ||
      url.password.length > 0 ||
      [...url.searchParams.keys()].some((key) =>
        SENSITIVE_QUERY_KEY_PATTERN.test(key),
      )
    ) {
      throw new PublishingPersistenceValidationError("pictureUrl");
    }
  } catch (error) {
    if (error instanceof PublishingPersistenceValidationError) {
      throw error;
    }

    throw new PublishingPersistenceValidationError("pictureUrl");
  }
};
