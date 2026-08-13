import { OAuthAuthorizationStateError } from "../errors/OAuthAuthorizationStateError.js";
import type { OAuthAuthorizationProvider } from "./OAuthAuthorizationProvider.js";
import { isOAuthAuthorizationProvider } from "./isOAuthAuthorizationProvider.js";

export const createOAuthRedirectUri = (
  publicOrigin: string,
  provider: OAuthAuthorizationProvider,
): string => {
  if (!isOAuthAuthorizationProvider(provider)) {
    throw new OAuthAuthorizationStateError("invalid");
  }

  try {
    const parsedOrigin = new URL(publicOrigin);

    if (
      parsedOrigin.protocol !== "https:" ||
      parsedOrigin.username.length > 0 ||
      parsedOrigin.password.length > 0 ||
      parsedOrigin.pathname !== "/" ||
      parsedOrigin.search.length > 0 ||
      parsedOrigin.hash.length > 0
    ) {
      throw new OAuthAuthorizationStateError("invalid");
    }

    const publicProvider =
      provider === "instagram-standalone" ? "instagram" : provider;

    return new URL(
      `/api/studio/publishing/oauth/${publicProvider}/callback`,
      parsedOrigin.origin,
    ).toString();
  } catch (error) {
    if (error instanceof OAuthAuthorizationStateError) {
      throw error;
    }

    throw new OAuthAuthorizationStateError("invalid");
  }
};
