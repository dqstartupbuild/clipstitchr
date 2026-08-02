import { randomBytes } from "node:crypto";

import { InvalidServiceAssertionError } from "../errors/InvalidServiceAssertionError.js";
import { resolveClerkTenantIdentity } from "../identity/resolveClerkTenantIdentity.js";
import { encodeBase64UrlJson } from "../crypto/encodeBase64UrlJson.js";
import type { ServiceAssertionClaims } from "./ServiceAssertionClaims.js";
import type { ServiceAssertionIssueInput } from "./ServiceAssertionIssueInput.js";
import { assertServiceAssertionIdentifier } from "./assertServiceAssertionIdentifier.js";
import { assertServiceAssertionRequestId } from "./assertServiceAssertionRequestId.js";
import { createServiceAssertionSignature } from "./createServiceAssertionSignature.js";
import { isServiceAssertionAction } from "./isServiceAssertionAction.js";
import {
  SERVICE_ASSERTION_DEFAULT_TTL_SECONDS,
  SERVICE_ASSERTION_HEADER,
  SERVICE_ASSERTION_MAX_TTL_SECONDS,
} from "./serviceAssertionConstants.js";

export const issueServiceAssertion = (input: ServiceAssertionIssueInput): string => {
  assertServiceAssertionIdentifier(input.issuer);
  assertServiceAssertionIdentifier(input.audience);
  assertServiceAssertionRequestId(input.requestId);

  if (!isServiceAssertionAction(input.action)) {
    throw new InvalidServiceAssertionError("claims");
  }

  const expectedIdentity = resolveClerkTenantIdentity({
    actorUserId: input.identity.actorUserId,
    ...(input.identity.organizationId === undefined
      ? {}
      : { activeOrganizationId: input.identity.organizationId }),
  });

  if (
    expectedIdentity.kind !== input.identity.kind ||
    expectedIdentity.tenantKey !== input.identity.tenantKey
  ) {
    throw new InvalidServiceAssertionError("claims");
  }

  const issuedAt = input.nowEpochSeconds ?? Math.floor(Date.now() / 1_000);
  const ttlSeconds = input.ttlSeconds ?? SERVICE_ASSERTION_DEFAULT_TTL_SECONDS;

  if (
    !Number.isSafeInteger(issuedAt) ||
    !Number.isSafeInteger(ttlSeconds) ||
    ttlSeconds < 1 ||
    ttlSeconds > SERVICE_ASSERTION_MAX_TTL_SECONDS
  ) {
    throw new InvalidServiceAssertionError("claims");
  }

  const claims: ServiceAssertionClaims = Object.freeze({
    version: 1,
    issuer: input.issuer,
    audience: input.audience,
    tenantKey: input.identity.tenantKey,
    actorUserId: input.identity.actorUserId,
    ...(input.identity.organizationId === undefined
      ? {}
      : { actorOrganizationId: input.identity.organizationId }),
    action: input.action,
    requestId: input.requestId,
    nonce: randomBytes(24).toString("base64url"),
    issuedAt,
    expiresAt: issuedAt + ttlSeconds,
  });
  const encodedHeader = encodeBase64UrlJson(SERVICE_ASSERTION_HEADER);
  const encodedClaims = encodeBase64UrlJson(claims);
  const encodedSignature = createServiceAssertionSignature(
    encodedHeader,
    encodedClaims,
    input.signingKey,
  ).toString("base64url");

  return `${encodedHeader}.${encodedClaims}.${encodedSignature}`;
};
