import { createSecretKey } from "node:crypto";

import { decodeBase64Key } from "../crypto/decodeBase64Key.js";
import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import type { ServiceAssertionSigningKey } from "./ServiceAssertionSigningKey.js";

const SERVICE_ASSERTION_KEY_BYTES = 32;

export const createServiceAssertionSigningKey = (
  encodedKey: string,
  fieldName = "PUBLISHING_SERVICE_ASSERTION_KEY_BASE64",
): ServiceAssertionSigningKey => {
  const decodedKey = decodeBase64Key(encodedKey);

  if (decodedKey?.byteLength !== SERVICE_ASSERTION_KEY_BYTES) {
    throw new PublishingServiceConfigurationError(fieldName);
  }

  return createSecretKey(decodedKey) as ServiceAssertionSigningKey;
};
