import type { OAuthAuthorizationProvider } from "../../oauth/OAuthAuthorizationProvider.js";

export interface ProviderAuthorizationRuntime {
  readonly id: OAuthAuthorizationProvider;
  createAuthorizationUrl(state: string, redirectUri: string): string;
}
