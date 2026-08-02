import { createHash } from "node:crypto";

export const createOAuthStateDigest = (state: string): string =>
  createHash("sha256").update(state, "ascii").digest("base64url");
