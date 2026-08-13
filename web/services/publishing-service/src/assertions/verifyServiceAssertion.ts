import { timingSafeEqual } from "node:crypto";

import { decodeBase64UrlJson } from "../crypto/decodeBase64UrlJson.js";
import { InvalidServiceAssertionError } from "../errors/InvalidServiceAssertionError.js";
import type { ServiceAssertionClaims } from "./ServiceAssertionClaims.js";
import type { ServiceAssertionVerificationInput } from "./ServiceAssertionVerificationInput.js";
import { createServiceAssertionReplayKey } from "./createServiceAssertionReplayKey.js";
import { createServiceAssertionSignature } from "./createServiceAssertionSignature.js";
import { isExpectedServiceAssertionAction } from "./isExpectedServiceAssertionAction.js";
import { parseServiceAssertionClaims } from "./parseServiceAssertionClaims.js";
import { parseServiceAssertionHeader } from "./parseServiceAssertionHeader.js";
import {
  SERVICE_ASSERTION_CLOCK_SKEW_SECONDS,
  SERVICE_ASSERTION_MAX_LENGTH,
  SERVICE_ASSERTION_MAX_TTL_SECONDS,
} from "./serviceAssertionConstants.js";

export const verifyServiceAssertion = async (
  input: ServiceAssertionVerificationInput,
): Promise<ServiceAssertionClaims> => {
  if (
    input.assertion.length === 0 ||
    input.assertion.length > SERVICE_ASSERTION_MAX_LENGTH
  ) {
    throw new InvalidServiceAssertionError("malformed");
  }

  const segments = input.assertion.split(".");

  if (segments.length !== 3) {
    throw new InvalidServiceAssertionError("malformed");
  }

  const [encodedHeader, encodedClaims, encodedSignature] = segments;

  if (
    encodedHeader === undefined ||
    encodedClaims === undefined ||
    encodedSignature === undefined ||
    !/^[A-Za-z0-9_-]{43}$/.test(encodedSignature)
  ) {
    throw new InvalidServiceAssertionError("malformed");
  }

  const suppliedSignature = Buffer.from(encodedSignature, "base64url");
  const expectedSignature = createServiceAssertionSignature(
    encodedHeader,
    encodedClaims,
    input.signingKey,
  );

  if (
    suppliedSignature.byteLength !== expectedSignature.byteLength ||
    suppliedSignature.toString("base64url") !== encodedSignature ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    throw new InvalidServiceAssertionError("signature");
  }

  let decodedHeader: unknown;
  let decodedClaims: unknown;

  try {
    decodedHeader = decodeBase64UrlJson(encodedHeader);
    decodedClaims = decodeBase64UrlJson(encodedClaims);
  } catch {
    throw new InvalidServiceAssertionError("malformed");
  }

  parseServiceAssertionHeader(decodedHeader);
  const claims = parseServiceAssertionClaims(decodedClaims);

  if (
    claims.issuer !== input.expectedIssuer ||
    claims.audience !== input.expectedAudience ||
    !isExpectedServiceAssertionAction(claims.action, input.expectedAction) ||
    claims.requestId !== input.expectedRequestId
  ) {
    throw new InvalidServiceAssertionError("binding");
  }

  const now = input.nowEpochSeconds ?? Math.floor(Date.now() / 1_000);
  const lifetime = claims.expiresAt - claims.issuedAt;

  if (
    !Number.isSafeInteger(now) ||
    lifetime < 1 ||
    lifetime > SERVICE_ASSERTION_MAX_TTL_SECONDS ||
    claims.issuedAt > now + SERVICE_ASSERTION_CLOCK_SKEW_SECONDS
  ) {
    throw new InvalidServiceAssertionError("claims");
  }

  if (now >= claims.expiresAt) {
    throw new InvalidServiceAssertionError("expired");
  }

  const wasConsumed = await input.replayProtector.consume(
    createServiceAssertionReplayKey(claims.issuer, claims.nonce),
    claims.expiresAt * 1_000,
  );

  if (!wasConsumed) {
    throw new InvalidServiceAssertionError("replayed");
  }

  return claims;
};
