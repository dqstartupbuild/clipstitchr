import { OAUTH_PKCE_MODES, type OAuthPkceMode } from "./OAuthPkceMode.js";

const OAUTH_PKCE_MODE_SET = new Set<string>(OAUTH_PKCE_MODES);

export const isOAuthPkceMode = (value: unknown): value is OAuthPkceMode =>
  typeof value === "string" && OAUTH_PKCE_MODE_SET.has(value);
