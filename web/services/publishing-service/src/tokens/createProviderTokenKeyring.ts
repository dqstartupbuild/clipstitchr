import { ProviderTokenEnvelopeError } from "../errors/ProviderTokenEnvelopeError.js";
import type { ProviderTokenCipherKey } from "./ProviderTokenCipherKey.js";
import type { ProviderTokenKeyring } from "./ProviderTokenKeyring.js";

export const createProviderTokenKeyring = (
  keys: readonly ProviderTokenCipherKey[],
): ProviderTokenKeyring => {
  const keyring = new Map<string, ProviderTokenCipherKey>();

  for (const key of keys) {
    if (keyring.has(key.id)) {
      throw new ProviderTokenEnvelopeError("invalid-key");
    }

    keyring.set(key.id, key);
  }

  return keyring;
};
