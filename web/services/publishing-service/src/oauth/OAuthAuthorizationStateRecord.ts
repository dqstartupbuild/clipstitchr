import type { OAuthAuthorizationProvider } from "./OAuthAuthorizationProvider.js";
import type { OAuthAuthorizationReturnPath } from "./OAuthAuthorizationReturnPath.js";
import type { OAuthPkceMode } from "./OAuthPkceMode.js";

export type OAuthAuthorizationStateRecord = Readonly<{
  version: 1;
  stateDigest: string;
  tenantKey: string;
  actorUserId: string;
  actorOrganizationId?: string;
  provider: OAuthAuthorizationProvider;
  pkceMode: OAuthPkceMode;
  redirectUri: string;
  returnPath: OAuthAuthorizationReturnPath;
  codeVerifier?: string;
  codeChallenge?: string;
  issuedAtEpochMilliseconds: number;
  expiresAtEpochMilliseconds: number;
}>;
