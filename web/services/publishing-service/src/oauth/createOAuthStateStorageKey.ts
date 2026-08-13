import { createOAuthStateDigest } from "./createOAuthStateDigest.js";

export const createOAuthStateStorageKey = (state: string): string =>
  `oauth-authorization-state:v1:${createOAuthStateDigest(state)}`;
