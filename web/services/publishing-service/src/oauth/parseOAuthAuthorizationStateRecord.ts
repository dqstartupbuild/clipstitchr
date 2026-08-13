import { decodeBase64UrlBytes } from "../crypto/decodeBase64UrlBytes.js";
import { OAuthAuthorizationStateError } from "../errors/OAuthAuthorizationStateError.js";
import { resolveClerkTenantIdentity } from "../identity/resolveClerkTenantIdentity.js";
import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import type { OAuthAuthorizationStateRecord } from "./OAuthAuthorizationStateRecord.js";
import { assertOAuthRedirectUri } from "./assertOAuthRedirectUri.js";
import { createPkceCodeChallenge } from "./createPkceCodeChallenge.js";
import { isOAuthAuthorizationProvider } from "./isOAuthAuthorizationProvider.js";
import { isOAuthAuthorizationReturnPath } from "./isOAuthAuthorizationReturnPath.js";
import { isOAuthPkceMode } from "./isOAuthPkceMode.js";
import {
  OAUTH_PKCE_VERIFIER_BYTES,
  OAUTH_STATE_MAX_TTL_SECONDS,
  OAUTH_STATE_MIN_TTL_SECONDS,
} from "./oauthAuthorizationStateConstants.js";

const REQUIRED_RECORD_KEYS = [
  "version",
  "stateDigest",
  "tenantKey",
  "actorUserId",
  "provider",
  "pkceMode",
  "redirectUri",
  "returnPath",
  "issuedAtEpochMilliseconds",
  "expiresAtEpochMilliseconds",
] as const;
const ALLOWED_RECORD_KEYS = new Set<string>([
  ...REQUIRED_RECORD_KEYS,
  "actorOrganizationId",
  "codeVerifier",
  "codeChallenge",
]);

export const parseOAuthAuthorizationStateRecord = (
  serializedRecord: string,
  expectedStateDigest: string,
): OAuthAuthorizationStateRecord => {
  let value: unknown;

  try {
    value = JSON.parse(serializedRecord) as unknown;
  } catch {
    throw new OAuthAuthorizationStateError("invalid");
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new OAuthAuthorizationStateError("invalid");
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  const actorOrganizationId = record["actorOrganizationId"];

  if (
    keys.some((key) => !ALLOWED_RECORD_KEYS.has(key)) ||
    REQUIRED_RECORD_KEYS.some((key) => !(key in record)) ||
    record["version"] !== 1 ||
    record["stateDigest"] !== expectedStateDigest ||
    typeof record["tenantKey"] !== "string" ||
    typeof record["actorUserId"] !== "string" ||
    (actorOrganizationId !== undefined && typeof actorOrganizationId !== "string") ||
    !isOAuthAuthorizationProvider(record["provider"]) ||
    !isOAuthPkceMode(record["pkceMode"]) ||
    typeof record["redirectUri"] !== "string" ||
    !isOAuthAuthorizationReturnPath(record["returnPath"]) ||
    !Number.isSafeInteger(record["issuedAtEpochMilliseconds"]) ||
    !Number.isSafeInteger(record["expiresAtEpochMilliseconds"])
  ) {
    throw new OAuthAuthorizationStateError("invalid");
  }

  const codeVerifier = record["codeVerifier"];
  const codeChallenge = record["codeChallenge"];

  if (
    (record["pkceMode"] === "none" &&
      (codeVerifier !== undefined || codeChallenge !== undefined)) ||
    (record["pkceMode"] === "rfc7636-s256" &&
      (typeof codeVerifier !== "string" ||
        decodeBase64UrlBytes(codeVerifier)?.byteLength !==
          OAUTH_PKCE_VERIFIER_BYTES ||
        typeof codeChallenge !== "string" ||
        codeChallenge !== createPkceCodeChallenge(codeVerifier)))
  ) {
    throw new OAuthAuthorizationStateError("invalid");
  }

  const parsedCodeVerifier =
    typeof codeVerifier === "string" ? codeVerifier : undefined;
  const parsedCodeChallenge =
    typeof codeChallenge === "string" ? codeChallenge : undefined;

  assertOAuthRedirectUri(record["redirectUri"], record["provider"]);

  let identity: ClerkTenantIdentity;

  try {
    identity = resolveClerkTenantIdentity({
      actorUserId: record["actorUserId"],
      ...(actorOrganizationId === undefined
        ? {}
        : { activeOrganizationId: actorOrganizationId }),
    });
  } catch {
    throw new OAuthAuthorizationStateError("invalid");
  }

  const issuedAtEpochMilliseconds = record["issuedAtEpochMilliseconds"] as number;
  const expiresAtEpochMilliseconds = record["expiresAtEpochMilliseconds"] as number;
  const lifetimeMilliseconds =
    expiresAtEpochMilliseconds - issuedAtEpochMilliseconds;

  if (
    identity.tenantKey !== record["tenantKey"] ||
    lifetimeMilliseconds < OAUTH_STATE_MIN_TTL_SECONDS * 1_000 ||
    lifetimeMilliseconds > OAUTH_STATE_MAX_TTL_SECONDS * 1_000
  ) {
    throw new OAuthAuthorizationStateError("invalid");
  }

  return Object.freeze({
    version: 1,
    stateDigest: expectedStateDigest,
    tenantKey: record["tenantKey"],
    actorUserId: record["actorUserId"],
    ...(actorOrganizationId === undefined ? {} : { actorOrganizationId }),
    provider: record["provider"],
    pkceMode: record["pkceMode"],
    redirectUri: record["redirectUri"],
    returnPath: record["returnPath"],
    ...(parsedCodeVerifier === undefined
      ? {}
      : { codeVerifier: parsedCodeVerifier }),
    ...(parsedCodeChallenge === undefined
      ? {}
      : { codeChallenge: parsedCodeChallenge }),
    issuedAtEpochMilliseconds,
    expiresAtEpochMilliseconds,
  });
};
