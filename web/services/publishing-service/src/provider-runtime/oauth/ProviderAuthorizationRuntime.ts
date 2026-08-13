import type { OAuthAuthorizationProvider } from "../../oauth/OAuthAuthorizationProvider.js";
import type { OAuthPkceMode } from "../../oauth/OAuthPkceMode.js";

export interface ProviderAuthorizationRuntime {
  readonly id: OAuthAuthorizationProvider;
  readonly pkceMode?: OAuthPkceMode;
  createAuthorizationUrl(
    state: string,
    redirectUri: string,
    pkce?: Readonly<{ codeChallenge: string; codeChallengeMethod: "S256" }>,
  ): string;
}
