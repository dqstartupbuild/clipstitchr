import { OAuthAuthorizationStateError } from "../errors/OAuthAuthorizationStateError.js";
import type { OAuthAuthorizationProvider } from "./OAuthAuthorizationProvider.js";
import { createOAuthRedirectUri } from "./createOAuthRedirectUri.js";

export const assertOAuthRedirectUri = (
  redirectUri: string,
  provider: OAuthAuthorizationProvider,
): void => {
  try {
    const parsedUri = new URL(redirectUri);

    if (createOAuthRedirectUri(parsedUri.origin, provider) !== redirectUri) {
      throw new OAuthAuthorizationStateError("invalid");
    }
  } catch (error) {
    if (error instanceof OAuthAuthorizationStateError) {
      throw error;
    }

    throw new OAuthAuthorizationStateError("invalid");
  }
};
