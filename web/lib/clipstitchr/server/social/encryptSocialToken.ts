import { createCipheriv, randomBytes } from "node:crypto";
import type { SocialTokenEnvelope } from "../../social/types/SocialTokenEnvelope";
import { readSocialTokenKeyRing } from "./readSocialTokenKeyRing";

export function encryptSocialToken(token: string): SocialTokenEnvelope {
  const normalized = token.trim();

  if (!normalized) {
    throw new Error("A social access token is required.");
  }

  const { currentVersion, keys } = readSocialTokenKeyRing();
  const key = keys.get(currentVersion);

  if (!key) {
    throw new Error("The current social token encryption key is unavailable.");
  }

  const initializationVector = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, initializationVector);
  const encrypted = Buffer.concat([
    cipher.update(normalized, "utf8"),
    cipher.final(),
  ]);
  const authenticationTag = cipher.getAuthTag();

  return {
    ciphertext: [
      initializationVector.toString("base64url"),
      authenticationTag.toString("base64url"),
      encrypted.toString("base64url"),
    ].join("."),
    version: currentVersion,
  };
}
