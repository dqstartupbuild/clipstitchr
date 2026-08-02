import { InvalidServiceAssertionError } from "../errors/InvalidServiceAssertionError.js";
import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import { resolveClerkTenantIdentity } from "../identity/resolveClerkTenantIdentity.js";
import type { ServiceAssertionClaims } from "./ServiceAssertionClaims.js";
import { assertServiceAssertionIdentifier } from "./assertServiceAssertionIdentifier.js";
import { assertServiceAssertionRequestId } from "./assertServiceAssertionRequestId.js";
import { isServiceAssertionAction } from "./isServiceAssertionAction.js";

const NONCE_PATTERN = /^[A-Za-z0-9_-]{32}$/;
const REQUIRED_CLAIM_KEYS = [
  "version",
  "issuer",
  "audience",
  "tenantKey",
  "actorUserId",
  "action",
  "requestId",
  "nonce",
  "issuedAt",
  "expiresAt",
] as const;
const ALLOWED_CLAIM_KEYS = new Set<string>([
  ...REQUIRED_CLAIM_KEYS,
  "actorOrganizationId",
]);

export const parseServiceAssertionClaims = (
  value: unknown,
): ServiceAssertionClaims => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new InvalidServiceAssertionError("claims");
  }

  const claims = value as Record<string, unknown>;
  const actorOrganizationId = claims["actorOrganizationId"];
  const claimKeys = Object.keys(claims);

  if (
    claimKeys.some((key) => !ALLOWED_CLAIM_KEYS.has(key)) ||
    REQUIRED_CLAIM_KEYS.some((key) => !(key in claims)) ||
    claims["version"] !== 1 ||
    typeof claims["issuer"] !== "string" ||
    typeof claims["audience"] !== "string" ||
    typeof claims["tenantKey"] !== "string" ||
    typeof claims["actorUserId"] !== "string" ||
    (actorOrganizationId !== undefined && typeof actorOrganizationId !== "string") ||
    !isServiceAssertionAction(claims["action"]) ||
    typeof claims["requestId"] !== "string" ||
    typeof claims["nonce"] !== "string" ||
    !NONCE_PATTERN.test(claims["nonce"]) ||
    !Number.isSafeInteger(claims["issuedAt"]) ||
    !Number.isSafeInteger(claims["expiresAt"])
  ) {
    throw new InvalidServiceAssertionError("claims");
  }

  assertServiceAssertionIdentifier(claims["issuer"]);
  assertServiceAssertionIdentifier(claims["audience"]);
  assertServiceAssertionRequestId(claims["requestId"]);

  let identity: ClerkTenantIdentity;

  try {
    identity = resolveClerkTenantIdentity({
      actorUserId: claims["actorUserId"],
      ...(actorOrganizationId === undefined
        ? {}
        : { activeOrganizationId: actorOrganizationId }),
    });
  } catch {
    throw new InvalidServiceAssertionError("claims");
  }

  if (identity.tenantKey !== claims["tenantKey"]) {
    throw new InvalidServiceAssertionError("claims");
  }

  return Object.freeze({
    version: 1,
    issuer: claims["issuer"],
    audience: claims["audience"],
    tenantKey: claims["tenantKey"],
    actorUserId: claims["actorUserId"],
    ...(actorOrganizationId === undefined ? {} : { actorOrganizationId }),
    action: claims["action"],
    requestId: claims["requestId"],
    nonce: claims["nonce"],
    issuedAt: claims["issuedAt"] as number,
    expiresAt: claims["expiresAt"] as number,
  });
};
