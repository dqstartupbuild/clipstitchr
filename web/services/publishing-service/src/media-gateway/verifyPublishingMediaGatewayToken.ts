import { createDecipheriv, createHmac, timingSafeEqual } from "node:crypto";

import { PublishingMediaGatewayTokenError } from "./PublishingMediaGatewayTokenError.js";
import { normalizePublishingMediaPublicOrigin } from "./normalizePublishingMediaPublicOrigin.js";
import { validatePublishingMediaGatewayTokenClaims } from "./validatePublishingMediaGatewayTokenClaims.js";

export const verifyPublishingMediaGatewayToken = (
  token: string,
  secret: string,
  expectedOrigin: string,
  nowEpochMs = Date.now(),
) => {
  if (
    token.length < 80 ||
    token.length > 8_192 ||
    Buffer.byteLength(secret, "utf8") < 32
  ) {
    throw new PublishingMediaGatewayTokenError("invalid");
  }

  const segments = token.split(".");

  if (
    segments.length !== 5 ||
    segments[0] !== "v1" ||
    !/^[A-Za-z0-9_-]{16}$/u.test(segments[1] ?? "") ||
    !/^[A-Za-z0-9_-]{1,6000}$/u.test(segments[2] ?? "") ||
    !/^[A-Za-z0-9_-]{22}$/u.test(segments[3] ?? "") ||
    !/^[A-Za-z0-9_-]{43}$/u.test(segments[4] ?? "") ||
    segments.slice(1).some(
      (segment) =>
        Buffer.from(segment, "base64url").toString("base64url") !== segment,
    )
  ) {
    throw new PublishingMediaGatewayTokenError("invalid");
  }

  const unsignedToken = segments.slice(0, 4).join(".");
  const providedSignature = Buffer.from(segments[4] as string, "base64url");
  const expectedSignature = createHmac("sha256", secret)
    .update("clipstitchr:publishing-media-signature:v1\0", "utf8")
    .update(unsignedToken, "utf8")
    .digest();

  if (
    providedSignature.byteLength !== expectedSignature.byteLength ||
    !timingSafeEqual(providedSignature, expectedSignature)
  ) {
    throw new PublishingMediaGatewayTokenError("invalid");
  }

  let plaintext: Buffer;

  try {
    const encryptionKey = createHmac("sha256", secret)
      .update("clipstitchr:publishing-media-encryption:v1", "utf8")
      .digest();
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey,
      Buffer.from(segments[1] as string, "base64url"),
    );
    decipher.setAAD(Buffer.from("v1", "utf8"));
    decipher.setAuthTag(Buffer.from(segments[3] as string, "base64url"));
    plaintext = Buffer.concat([
      decipher.update(Buffer.from(segments[2] as string, "base64url")),
      decipher.final(),
    ]);
  } catch {
    throw new PublishingMediaGatewayTokenError("invalid");
  }

  if (plaintext.byteLength > 4_096) {
    throw new PublishingMediaGatewayTokenError("invalid");
  }

  let parsedClaims: unknown;

  try {
    parsedClaims = JSON.parse(plaintext.toString("utf8")) as unknown;
  } catch {
    throw new PublishingMediaGatewayTokenError("invalid");
  }

  const claims = validatePublishingMediaGatewayTokenClaims(parsedClaims);
  const normalizedExpectedOrigin =
    normalizePublishingMediaPublicOrigin(expectedOrigin);

  if (
    claims.audience !== normalizedExpectedOrigin ||
    claims.issuedAtEpochMs > nowEpochMs + 60_000
  ) {
    throw new PublishingMediaGatewayTokenError("invalid");
  }

  if (claims.expiresAtEpochMs <= nowEpochMs) {
    throw new PublishingMediaGatewayTokenError("expired");
  }

  return Object.freeze(claims);
};
