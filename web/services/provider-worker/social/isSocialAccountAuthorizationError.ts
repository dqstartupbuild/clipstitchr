import { SocialApiError } from "./SocialApiError";

const AUTHORIZATION_PROVIDER_CODES = new Set([
  "190",
  "access_token_invalid",
  "scope_not_authorized",
]);

export function isSocialAccountAuthorizationError(error: unknown) {
  return (
    error instanceof SocialApiError &&
    (error.responseStatus === 401 ||
      (error.providerCode !== undefined &&
        AUTHORIZATION_PROVIDER_CODES.has(error.providerCode)))
  );
}
