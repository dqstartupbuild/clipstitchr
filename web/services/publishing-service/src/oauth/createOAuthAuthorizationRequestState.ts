import { randomBytes } from "node:crypto";

import { OAuthAuthorizationStateError } from "../errors/OAuthAuthorizationStateError.js";
import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import { resolveClerkTenantIdentity } from "../identity/resolveClerkTenantIdentity.js";
import type { OAuthAuthorizationRequestState } from "./OAuthAuthorizationRequestState.js";
import type { OAuthAuthorizationStateIssueInput } from "./OAuthAuthorizationStateIssueInput.js";
import { createOAuthRedirectUri } from "./createOAuthRedirectUri.js";
import { createOAuthStateDigest } from "./createOAuthStateDigest.js";
import { createOAuthStateStorageKey } from "./createOAuthStateStorageKey.js";
import { createPkceCodeChallenge } from "./createPkceCodeChallenge.js";
import { isOAuthAuthorizationProvider } from "./isOAuthAuthorizationProvider.js";
import { isOAuthAuthorizationReturnPath } from "./isOAuthAuthorizationReturnPath.js";
import { isOAuthPkceMode } from "./isOAuthPkceMode.js";
import {
  OAUTH_PKCE_VERIFIER_BYTES,
  OAUTH_STATE_DEFAULT_TTL_SECONDS,
  OAUTH_STATE_ENTROPY_BYTES,
  OAUTH_STATE_MAX_TTL_SECONDS,
  OAUTH_STATE_MIN_TTL_SECONDS,
  OAUTH_STATE_STORAGE_ATTEMPTS,
} from "./oauthAuthorizationStateConstants.js";

export const createOAuthAuthorizationRequestState = async (
  input: OAuthAuthorizationStateIssueInput,
): Promise<OAuthAuthorizationRequestState> => {
  let identity: ClerkTenantIdentity;

  try {
    identity = resolveClerkTenantIdentity({
      actorUserId: input.identity.actorUserId,
      ...(input.identity.organizationId === undefined
        ? {}
        : { activeOrganizationId: input.identity.organizationId }),
    });
  } catch {
    throw new OAuthAuthorizationStateError("invalid");
  }

  if (
    identity.kind !== input.identity.kind ||
    identity.tenantKey !== input.identity.tenantKey ||
    !isOAuthAuthorizationProvider(input.provider) ||
    !isOAuthPkceMode(input.pkceMode) ||
    !isOAuthAuthorizationReturnPath(input.returnPath)
  ) {
    throw new OAuthAuthorizationStateError("invalid");
  }

  const redirectUri = createOAuthRedirectUri(input.publicOrigin, input.provider);
  const ttlSeconds = input.ttlSeconds ?? OAUTH_STATE_DEFAULT_TTL_SECONDS;
  const issuedAtEpochMilliseconds = input.nowEpochMilliseconds ?? Date.now();

  if (
    !Number.isSafeInteger(ttlSeconds) ||
    ttlSeconds < OAUTH_STATE_MIN_TTL_SECONDS ||
    ttlSeconds > OAUTH_STATE_MAX_TTL_SECONDS ||
    !Number.isSafeInteger(issuedAtEpochMilliseconds) ||
    issuedAtEpochMilliseconds < 0
  ) {
    throw new OAuthAuthorizationStateError("invalid");
  }

  const ttlMilliseconds = ttlSeconds * 1_000;
  const expiresAtEpochMilliseconds = issuedAtEpochMilliseconds + ttlMilliseconds;

  for (let attempt = 0; attempt < OAUTH_STATE_STORAGE_ATTEMPTS; attempt += 1) {
    const state = randomBytes(OAUTH_STATE_ENTROPY_BYTES).toString("base64url");
    const codeVerifier =
      input.pkceMode === "rfc7636-s256"
        ? randomBytes(OAUTH_PKCE_VERIFIER_BYTES).toString("base64url")
        : undefined;
    const codeChallenge =
      codeVerifier === undefined
        ? undefined
        : createPkceCodeChallenge(codeVerifier);
    const stateDigest = createOAuthStateDigest(state);
    const serializedRecord = JSON.stringify({
      version: 1,
      stateDigest,
      tenantKey: identity.tenantKey,
      actorUserId: identity.actorUserId,
      ...(identity.organizationId === undefined
        ? {}
        : { actorOrganizationId: identity.organizationId }),
      provider: input.provider,
      pkceMode: input.pkceMode,
      redirectUri,
      returnPath: input.returnPath,
      ...(codeVerifier === undefined ? {} : { codeVerifier }),
      ...(codeChallenge === undefined ? {} : { codeChallenge }),
      issuedAtEpochMilliseconds,
      expiresAtEpochMilliseconds,
    });

    try {
      const wasStored = await input.store.create(
        createOAuthStateStorageKey(state),
        serializedRecord,
        ttlMilliseconds,
      );

      if (wasStored) {
        return input.pkceMode === "rfc7636-s256"
          ? Object.freeze({
              state,
              pkceMode: input.pkceMode,
              codeChallenge: codeChallenge as string,
              codeChallengeMethod: "S256" as const,
              redirectUri,
              expiresAtEpochMilliseconds,
            })
          : Object.freeze({
              state,
              pkceMode: input.pkceMode,
              redirectUri,
              expiresAtEpochMilliseconds,
            });
      }
    } catch (error) {
      if (error instanceof OAuthAuthorizationStateError) {
        throw error;
      }

      throw new OAuthAuthorizationStateError("storage");
    }
  }

  throw new OAuthAuthorizationStateError("storage");
};
