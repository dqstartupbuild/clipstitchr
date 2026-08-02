import { createHash } from "node:crypto";

export const createServiceAssertionReplayKey = (
  issuer: string,
  nonce: string,
): string =>
  `service-assertion:v1:${createHash("sha256")
    .update(issuer, "utf8")
    .update("\0", "utf8")
    .update(nonce, "ascii")
    .digest("base64url")}`;
