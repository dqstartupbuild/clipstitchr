import { createHash } from "node:crypto";

export function createSocialCodeChallenge(codeVerifier: string) {
  return createHash("sha256")
    .update(codeVerifier, "utf8")
    .digest("base64url");
}
