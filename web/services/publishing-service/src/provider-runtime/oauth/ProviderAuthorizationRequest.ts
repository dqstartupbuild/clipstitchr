import type { OAuthAuthorizationRequestState } from "../../oauth/OAuthAuthorizationRequestState.js";

export type ProviderAuthorizationRequest = OAuthAuthorizationRequestState &
  Readonly<{ authorizationUrl: string }>;
