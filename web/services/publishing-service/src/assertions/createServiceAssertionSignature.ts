import { createHmac } from "node:crypto";

import type { ServiceAssertionSigningKey } from "./ServiceAssertionSigningKey.js";

export const createServiceAssertionSignature = (
  encodedHeader: string,
  encodedClaims: string,
  signingKey: ServiceAssertionSigningKey,
): Buffer =>
  createHmac("sha256", signingKey)
    .update(`${encodedHeader}.${encodedClaims}`, "ascii")
    .digest();
