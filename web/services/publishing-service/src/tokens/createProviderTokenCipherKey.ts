import { createSecretKey } from "node:crypto";

import { decodeBase64Key } from "../crypto/decodeBase64Key.js";
import { ProviderTokenEnvelopeError } from "../errors/ProviderTokenEnvelopeError.js";
import type { ProviderTokenCipherKey } from "./ProviderTokenCipherKey.js";

const PROVIDER_TOKEN_KEY_BYTES = 32;
const KEY_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export const createProviderTokenCipherKey = (
  id: string,
  encodedKey: string,
): ProviderTokenCipherKey => {
  const decodedKey = decodeBase64Key(encodedKey);

  if (!KEY_ID_PATTERN.test(id) || decodedKey?.byteLength !== PROVIDER_TOKEN_KEY_BYTES) {
    throw new ProviderTokenEnvelopeError("invalid-key");
  }

  return Object.freeze({
    id,
    key: createSecretKey(decodedKey),
    purpose: "provider-token-encryption" as const,
  });
};
