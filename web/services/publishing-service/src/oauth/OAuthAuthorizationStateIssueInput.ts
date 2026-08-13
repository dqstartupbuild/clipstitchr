import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import type { OAuthAuthorizationProvider } from "./OAuthAuthorizationProvider.js";
import type { OAuthAuthorizationReturnPath } from "./OAuthAuthorizationReturnPath.js";
import type { OAuthAuthorizationStateStore } from "./OAuthAuthorizationStateStore.js";
import type { OAuthPkceMode } from "./OAuthPkceMode.js";

export type OAuthAuthorizationStateIssueInput = Readonly<{
  identity: ClerkTenantIdentity;
  provider: OAuthAuthorizationProvider;
  pkceMode: OAuthPkceMode;
  publicOrigin: string;
  returnPath: OAuthAuthorizationReturnPath;
  store: OAuthAuthorizationStateStore;
  ttlSeconds?: number;
  nowEpochMilliseconds?: number;
}>;
