import type { OAuthPkceMode } from "./OAuthPkceMode.js";

type OAuthAuthorizationRequestStateBase = Readonly<{
  state: string;
  redirectUri: string;
  expiresAtEpochMilliseconds: number;
}>;

export type OAuthAuthorizationRequestState =
  OAuthAuthorizationRequestStateBase &
    (
      | Readonly<{ pkceMode: Extract<OAuthPkceMode, "none"> }>
      | Readonly<{
          pkceMode: Extract<OAuthPkceMode, "rfc7636-s256">;
          codeChallenge: string;
          codeChallengeMethod: "S256";
        }>
    );
