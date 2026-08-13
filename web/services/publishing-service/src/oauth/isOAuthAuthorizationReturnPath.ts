import {
  OAUTH_AUTHORIZATION_RETURN_PATHS,
  type OAuthAuthorizationReturnPath,
} from "./OAuthAuthorizationReturnPath.js";

const OAUTH_RETURN_PATH_SET = new Set<string>(OAUTH_AUTHORIZATION_RETURN_PATHS);

export const isOAuthAuthorizationReturnPath = (
  value: unknown,
): value is OAuthAuthorizationReturnPath =>
  typeof value === "string" && OAUTH_RETURN_PATH_SET.has(value);
