import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";

const SENSITIVE_QUERY_KEY_PATTERN =
  /^(?:access_token|token|signature|sig|x-amz-.+|authorization)$/iu;

export const assertObservableProviderUrl = (value: string): void => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new PublishingPersistenceValidationError("observableUrl");
  }

  if (
    url.protocol !== "https:" ||
    url.username !== "" ||
    url.password !== "" ||
    value.length > 2_048 ||
    [...url.searchParams.keys()].some((key) =>
      SENSITIVE_QUERY_KEY_PATTERN.test(key),
    )
  ) {
    throw new PublishingPersistenceValidationError("observableUrl");
  }
};
