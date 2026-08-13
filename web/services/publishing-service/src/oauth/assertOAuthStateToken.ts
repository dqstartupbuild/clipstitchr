import { decodeBase64UrlBytes } from "../crypto/decodeBase64UrlBytes.js";
import { OAuthAuthorizationStateError } from "../errors/OAuthAuthorizationStateError.js";
import { OAUTH_STATE_ENTROPY_BYTES } from "./oauthAuthorizationStateConstants.js";

export const assertOAuthStateToken = (state: string): void => {
  if (
    typeof state !== "string" ||
    decodeBase64UrlBytes(state)?.byteLength !== OAUTH_STATE_ENTROPY_BYTES
  ) {
    throw new OAuthAuthorizationStateError("invalid");
  }
};
