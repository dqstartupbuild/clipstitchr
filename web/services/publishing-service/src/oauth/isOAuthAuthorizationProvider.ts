import {
  OAUTH_AUTHORIZATION_PROVIDERS,
  type OAuthAuthorizationProvider,
} from "./OAuthAuthorizationProvider.js";

const OAUTH_PROVIDER_SET = new Set<string>(OAUTH_AUTHORIZATION_PROVIDERS);

export const isOAuthAuthorizationProvider = (
  value: unknown,
): value is OAuthAuthorizationProvider =>
  typeof value === "string" && OAUTH_PROVIDER_SET.has(value);
