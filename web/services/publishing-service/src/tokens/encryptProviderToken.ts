import { createCipheriv, randomBytes } from "node:crypto";

import { ProviderTokenEnvelopeError } from "../errors/ProviderTokenEnvelopeError.js";
import type { ProviderTokenCipherKey } from "./ProviderTokenCipherKey.js";
import type { ProviderTokenContext } from "./ProviderTokenContext.js";
import type { ProviderTokenEnvelope } from "./ProviderTokenEnvelope.js";
import { assertProviderTokenContext } from "./assertProviderTokenContext.js";
import { encodeProviderTokenAdditionalData } from "./encodeProviderTokenAdditionalData.js";

const ENVELOPE_VERSION = "cst1";
const NONCE_BYTES = 12;
const AUTH_TAG_BYTES = 16;
const MAX_TOKEN_BYTES = 65_536;

export const encryptProviderToken = (
  plaintextToken: string,
  key: ProviderTokenCipherKey,
  context: ProviderTokenContext,
): ProviderTokenEnvelope => {
  assertProviderTokenContext(context);
  const plaintext = Buffer.from(plaintextToken, "utf8");

  if (plaintext.byteLength < 1 || plaintext.byteLength > MAX_TOKEN_BYTES) {
    plaintext.fill(0);
    throw new ProviderTokenEnvelopeError("malformed");
  }

  try {
    const nonce = randomBytes(NONCE_BYTES);
    const cipher = createCipheriv("aes-256-gcm", key.key, nonce, {
      authTagLength: AUTH_TAG_BYTES,
    });
    cipher.setAAD(encodeProviderTokenAdditionalData(context));
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authenticationTag = cipher.getAuthTag();

    return `${ENVELOPE_VERSION}.${key.id}.${nonce.toString(
      "base64url",
    )}.${ciphertext.toString("base64url")}.${authenticationTag.toString(
      "base64url",
    )}` as ProviderTokenEnvelope;
  } finally {
    plaintext.fill(0);
  }
};
