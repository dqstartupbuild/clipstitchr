import { createHash } from "node:crypto";

export const createPkceCodeChallenge = (codeVerifier: string): string =>
  createHash("sha256").update(codeVerifier, "ascii").digest("base64url");
