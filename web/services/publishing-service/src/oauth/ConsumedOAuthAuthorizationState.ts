import type { OAuthAuthorizationProvider } from "./OAuthAuthorizationProvider.js";
import type { OAuthAuthorizationReturnPath } from "./OAuthAuthorizationReturnPath.js";
import type { OAuthPkceMode } from "./OAuthPkceMode.js";

type ConsumedOAuthAuthorizationStateBase = Readonly<{
  tenantKey: string;
  actorUserId: string;
  actorOrganizationId?: string;
  provider: OAuthAuthorizationProvider;
  redirectUri: string;
  returnPath: OAuthAuthorizationReturnPath;
  issuedAtEpochMilliseconds: number;
  expiresAtEpochMilliseconds: number;
}>;

export type ConsumedOAuthAuthorizationState =
  ConsumedOAuthAuthorizationStateBase &
    (
      | Readonly<{ pkceMode: Extract<OAuthPkceMode, "none"> }>
      | Readonly<{
          pkceMode: Extract<OAuthPkceMode, "rfc7636-s256">;
          codeVerifier: string;
        }>
    );
