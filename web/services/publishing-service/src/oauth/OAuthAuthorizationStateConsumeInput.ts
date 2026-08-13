import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import type { OAuthAuthorizationProvider } from "./OAuthAuthorizationProvider.js";
import type { OAuthAuthorizationReturnPath } from "./OAuthAuthorizationReturnPath.js";
import type { OAuthAuthorizationStateStore } from "./OAuthAuthorizationStateStore.js";
import type { OAuthPkceMode } from "./OAuthPkceMode.js";

export type OAuthAuthorizationStateConsumeInput = Readonly<{
  state: string;
  expectedIdentity: ClerkTenantIdentity;
  expectedProvider: OAuthAuthorizationProvider;
  expectedPkceMode: OAuthPkceMode;
  expectedPublicOrigin: string;
  expectedReturnPath: OAuthAuthorizationReturnPath;
  store: OAuthAuthorizationStateStore;
  nowEpochMilliseconds?: number;
}>;
