import type { PublishingMediaGatewayTokenClaims } from "./PublishingMediaGatewayTokenClaims.js";
import { PublishingMediaGatewayTokenError } from "./PublishingMediaGatewayTokenError.js";

const MAX_MEDIA_BYTES = 1_024 * 1_024 * 1_024;
const STUDIO_PUBLISHING_MEDIA_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
]);
const TOKEN_CLAIM_KEYS = new Set([
  "audience",
  "checksum",
  "contentType",
  "etag",
  "expiresAtEpochMs",
  "grantKey",
  "issuedAtEpochMs",
  "objectKey",
  "provider",
  "quotaIdentity",
  "schema",
  "sizeBytes",
  "versionId",
]);

export const validatePublishingMediaGatewayTokenClaims = (
  value: unknown,
): PublishingMediaGatewayTokenClaims => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new PublishingMediaGatewayTokenError("invalid");
  }

  const claims = value as Partial<PublishingMediaGatewayTokenClaims>;
  const identityCount =
    Number(Boolean(claims.versionId)) + Number(Boolean(claims.etag));

  if (
    Object.keys(claims).some((key) => !TOKEN_CLAIM_KEYS.has(key)) ||
    claims.schema !== 1 ||
    typeof claims.audience !== "string" ||
    claims.audience.length > 256 ||
    typeof claims.contentType !== "string" ||
    !STUDIO_PUBLISHING_MEDIA_CONTENT_TYPES.has(claims.contentType) ||
    typeof claims.expiresAtEpochMs !== "number" ||
    !Number.isSafeInteger(claims.expiresAtEpochMs) ||
    typeof claims.issuedAtEpochMs !== "number" ||
    !Number.isSafeInteger(claims.issuedAtEpochMs) ||
    claims.expiresAtEpochMs <= claims.issuedAtEpochMs ||
    claims.expiresAtEpochMs - claims.issuedAtEpochMs > 7_200_000 ||
    typeof claims.grantKey !== "string" ||
    !/^pmg_[A-Za-z0-9_-]{22}$/u.test(claims.grantKey) ||
    typeof claims.objectKey !== "string" ||
    claims.objectKey.length < 1 ||
    claims.objectKey.length > 1_024 ||
    claims.objectKey.startsWith("/") ||
    /[\u0000-\u001f\u007f]/u.test(claims.objectKey) ||
    (claims.provider !== "instagram" &&
      claims.provider !== "tiktok" &&
      claims.provider !== "youtube") ||
    (claims.provider === "instagram" && claims.contentType === "image/webp") ||
    (claims.provider === "youtube" &&
      claims.contentType !== "video/mp4" &&
      claims.contentType !== "image/jpeg" &&
      claims.contentType !== "image/png") ||
    typeof claims.quotaIdentity !== "string" ||
    !/^pmq_[A-Za-z0-9_-]{43}$/u.test(claims.quotaIdentity) ||
    typeof claims.sizeBytes !== "number" ||
    !Number.isSafeInteger(claims.sizeBytes) ||
    claims.sizeBytes < 1 ||
    claims.sizeBytes > MAX_MEDIA_BYTES ||
    identityCount < 1 ||
    (claims.versionId !== undefined &&
      (typeof claims.versionId !== "string" ||
        claims.versionId.length < 1 ||
        claims.versionId.length > 512 ||
        /[\u0000-\u001f\u007f]/u.test(claims.versionId))) ||
    (claims.etag !== undefined &&
      (typeof claims.etag !== "string" ||
        claims.etag.length < 1 ||
        claims.etag.length > 512 ||
        /[\u0000-\u001f\u007f]/u.test(claims.etag))) ||
    (claims.checksum !== undefined &&
      (typeof claims.checksum !== "string" ||
        claims.checksum.length < 1 ||
        claims.checksum.length > 512 ||
        /[\u0000-\u001f\u007f]/u.test(claims.checksum)))
  ) {
    throw new PublishingMediaGatewayTokenError("invalid");
  }

  return claims as PublishingMediaGatewayTokenClaims;
};
