import { createDecipheriv } from "node:crypto";
import { readSocialTokenKeyRing } from "./readSocialTokenKeyRing";

export function decryptSocialToken(ciphertext: string, version: number) {
  const key = readSocialTokenKeyRing().keys.get(version);

  if (!key) {
    throw new Error(`Social token encryption key ${version} is unavailable.`);
  }

  const [initializationVectorValue, authenticationTagValue, encryptedValue] =
    ciphertext.split(".");

  if (
    !initializationVectorValue ||
    !authenticationTagValue ||
    !encryptedValue
  ) {
    throw new Error("The encrypted social token is malformed.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(initializationVectorValue, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authenticationTagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
