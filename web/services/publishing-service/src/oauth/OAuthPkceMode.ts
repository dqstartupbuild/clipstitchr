export const OAUTH_PKCE_MODES = ["none", "rfc7636-s256"] as const;

export type OAuthPkceMode = (typeof OAUTH_PKCE_MODES)[number];
