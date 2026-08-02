export const OAUTH_AUTHORIZATION_PROVIDERS = [
  "instagram",
  "instagram-standalone",
  "tiktok",
] as const;

export type OAuthAuthorizationProvider =
  (typeof OAUTH_AUTHORIZATION_PROVIDERS)[number];
