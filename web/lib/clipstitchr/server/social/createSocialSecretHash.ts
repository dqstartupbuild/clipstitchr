import { createHash } from "node:crypto";

export function createSocialSecretHash(value: string) {
  return createHash("sha256").update(value, "utf8").digest("base64url");
}
