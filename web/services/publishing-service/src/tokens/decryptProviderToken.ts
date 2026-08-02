import { createDecipheriv } from "node:crypto";

import { decodeBase64UrlBytes } from "../crypto/decodeBase64UrlBytes.js";
import { ProviderTokenEnvelopeError } from "../errors/ProviderTokenEnvelopeError.js";
import type { ProviderTokenContext } from "./ProviderTokenContext.js";
import type { ProviderTokenEnvelope } from "./ProviderTokenEnvelope.js";
import type { ProviderTokenKeyring } from "./ProviderTokenKeyring.js";
import { assertProviderTokenContext } from "./assertProviderTokenContext.js";
import { encodeProviderTokenAdditionalData } from "./encodeProviderTokenAdditionalData.js";

const ENVELOPE_VERSION = "cst1";
const MAX_ENVELOPE_LENGTH = 131_072;
const NONCE_BYTES = 12;
const AUTH_TAG_BYTES = 16;

export const decryptProviderToken = (
  envelope: ProviderTokenEnvelope,
  keyring: ProviderTokenKeyring,
  context: ProviderTokenContext,
): string => {
  assertProviderTokenContext(context);

  if (envelope.length < 1 || envelope.length > MAX_ENVELOPE_LENGTH) {
    throw new ProviderTokenEnvelopeError("malformed");
  }

  const segments = envelope.split(".");

  if (segments.length !== 5) {
    throw new ProviderTokenEnvelopeError("malformed");
  }

  const [version, keyId, encodedNonce, encodedCiphertext, encodedTag] = segments;

  if (version !== ENVELOPE_VERSION) {
    throw new ProviderTokenEnvelopeError("unsupported-version");
  }

  if (
    keyId === undefined ||
    encodedNonce === undefined ||
    encodedCiphertext === undefined ||
    encodedTag === undefined
  ) {
    throw new ProviderTokenEnvelopeError("malformed");
  }

  const key = keyring.get(keyId);

  if (key === undefined) {
    throw new ProviderTokenEnvelopeError("unknown-key");
  }

  const nonce = decodeBase64UrlBytes(encodedNonce);
  const ciphertext = decodeBase64UrlBytes(encodedCiphertext);
  const authenticationTag = decodeBase64UrlBytes(encodedTag);

  if (
    nonce?.byteLength !== NONCE_BYTES ||
    ciphertext === null ||
    ciphertext.byteLength < 1 ||
    authenticationTag?.byteLength !== AUTH_TAG_BYTES
  ) {
    throw new ProviderTokenEnvelopeError("malformed");
  }

  let plaintext: Buffer | undefined;

  try {
    const decipher = createDecipheriv("aes-256-gcm", key.key, nonce, {
      authTagLength: AUTH_TAG_BYTES,
    });
    decipher.setAAD(encodeProviderTokenAdditionalData(context));
    decipher.setAuthTag(authenticationTag);
    plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf8");
  } catch {
    throw new ProviderTokenEnvelopeError("authentication");
  } finally {
    plaintext?.fill(0);
  }
};
