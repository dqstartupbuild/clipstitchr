import { PublishingServiceConfigurationError } from "../errors/PublishingServiceConfigurationError.js";
import { ProviderTokenEnvelopeError } from "../errors/ProviderTokenEnvelopeError.js";
import type { ProviderTokenCipherKey } from "../tokens/ProviderTokenCipherKey.js";
import { createProviderTokenCipherKey } from "../tokens/createProviderTokenCipherKey.js";

export const parseOptionalProviderTokenCipherKey = (
  keyId: string | undefined,
  encodedKey: string | undefined,
): ProviderTokenCipherKey | undefined => {
  if (keyId === undefined && encodedKey === undefined) {
    return undefined;
  }

  if (keyId === undefined) {
    throw new PublishingServiceConfigurationError("PUBLISHING_TOKEN_KEY_ID");
  }

  if (encodedKey === undefined) {
    throw new PublishingServiceConfigurationError("PUBLISHING_TOKEN_KEY_BASE64");
  }

  try {
    return createProviderTokenCipherKey(keyId, encodedKey);
  } catch (error) {
    if (error instanceof ProviderTokenEnvelopeError) {
      throw new PublishingServiceConfigurationError(
        error.reason === "invalid-key" && !/^[A-Za-z0-9_-]{1,64}$/.test(keyId)
          ? "PUBLISHING_TOKEN_KEY_ID"
          : "PUBLISHING_TOKEN_KEY_BASE64",
      );
    }

    throw error;
  }
};
