import { OAuthAuthorizationStateError } from "../errors/OAuthAuthorizationStateError.js";
import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import { resolveClerkTenantIdentity } from "../identity/resolveClerkTenantIdentity.js";
import type { ConsumedOAuthAuthorizationState } from "./ConsumedOAuthAuthorizationState.js";
import type { OAuthAuthorizationStateConsumeInput } from "./OAuthAuthorizationStateConsumeInput.js";
import { assertOAuthStateToken } from "./assertOAuthStateToken.js";
import { createOAuthRedirectUri } from "./createOAuthRedirectUri.js";
import { createOAuthStateDigest } from "./createOAuthStateDigest.js";
import { createOAuthStateStorageKey } from "./createOAuthStateStorageKey.js";
import { isOAuthAuthorizationProvider } from "./isOAuthAuthorizationProvider.js";
import { isOAuthAuthorizationReturnPath } from "./isOAuthAuthorizationReturnPath.js";
import { isOAuthPkceMode } from "./isOAuthPkceMode.js";
import { parseOAuthAuthorizationStateRecord } from "./parseOAuthAuthorizationStateRecord.js";

const OAUTH_STATE_CLOCK_SKEW_MILLISECONDS = 5_000;

export const consumeOAuthAuthorizationRequestState = async (
  input: OAuthAuthorizationStateConsumeInput,
): Promise<ConsumedOAuthAuthorizationState> => {
  assertOAuthStateToken(input.state);

  if (
    !isOAuthAuthorizationProvider(input.expectedProvider) ||
    !isOAuthPkceMode(input.expectedPkceMode) ||
    !isOAuthAuthorizationReturnPath(input.expectedReturnPath)
  ) {
    throw new OAuthAuthorizationStateError("invalid");
  }

  const expectedRedirectUri = createOAuthRedirectUri(
    input.expectedPublicOrigin,
    input.expectedProvider,
  );

  let expectedIdentity: ClerkTenantIdentity;

  try {
    expectedIdentity = resolveClerkTenantIdentity({
      actorUserId: input.expectedIdentity.actorUserId,
      ...(input.expectedIdentity.organizationId === undefined
        ? {}
        : { activeOrganizationId: input.expectedIdentity.organizationId }),
    });
  } catch {
    throw new OAuthAuthorizationStateError("invalid");
  }

  if (
    expectedIdentity.kind !== input.expectedIdentity.kind ||
    expectedIdentity.tenantKey !== input.expectedIdentity.tenantKey
  ) {
    throw new OAuthAuthorizationStateError("invalid");
  }

  let serializedRecord: string | null;

  try {
    serializedRecord = await input.store.consume(
      createOAuthStateStorageKey(input.state),
    );
  } catch (error) {
    if (error instanceof OAuthAuthorizationStateError) {
      throw error;
    }

    throw new OAuthAuthorizationStateError("storage");
  }

  if (serializedRecord === null) {
    throw new OAuthAuthorizationStateError("unavailable");
  }

  const record = parseOAuthAuthorizationStateRecord(
    serializedRecord,
    createOAuthStateDigest(input.state),
  );
  const nowEpochMilliseconds = input.nowEpochMilliseconds ?? Date.now();

  if (!Number.isSafeInteger(nowEpochMilliseconds) || nowEpochMilliseconds < 0) {
    throw new OAuthAuthorizationStateError("invalid");
  }

  if (
    record.issuedAtEpochMilliseconds >
    nowEpochMilliseconds + OAUTH_STATE_CLOCK_SKEW_MILLISECONDS
  ) {
    throw new OAuthAuthorizationStateError("invalid");
  }

  if (nowEpochMilliseconds >= record.expiresAtEpochMilliseconds) {
    throw new OAuthAuthorizationStateError("expired");
  }

  if (
    record.tenantKey !== expectedIdentity.tenantKey ||
    record.actorUserId !== expectedIdentity.actorUserId ||
    record.actorOrganizationId !== expectedIdentity.organizationId ||
    record.provider !== input.expectedProvider ||
    record.pkceMode !== input.expectedPkceMode ||
    record.redirectUri !== expectedRedirectUri ||
    record.returnPath !== input.expectedReturnPath
  ) {
    throw new OAuthAuthorizationStateError("binding");
  }

  const consumedBase = {
    tenantKey: record.tenantKey,
    actorUserId: record.actorUserId,
    ...(record.actorOrganizationId === undefined
      ? {}
      : { actorOrganizationId: record.actorOrganizationId }),
    provider: record.provider,
    redirectUri: record.redirectUri,
    returnPath: record.returnPath,
    issuedAtEpochMilliseconds: record.issuedAtEpochMilliseconds,
    expiresAtEpochMilliseconds: record.expiresAtEpochMilliseconds,
  };

  return record.pkceMode === "rfc7636-s256"
    ? Object.freeze({
        ...consumedBase,
        pkceMode: record.pkceMode,
        codeVerifier: record.codeVerifier as string,
      })
    : Object.freeze({
        ...consumedBase,
        pkceMode: record.pkceMode,
      });
};
