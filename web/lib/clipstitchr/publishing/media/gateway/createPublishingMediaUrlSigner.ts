import { randomBytes } from "node:crypto";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import type { PublishingMediaUrlSigner } from "@/lib/clipstitchr/publishing/media/PublishingMediaUrlSigner";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import type { CreatePublishingMediaUrlSignerOptions } from "@/lib/clipstitchr/publishing/media/gateway/CreatePublishingMediaUrlSignerOptions";
import { normalizePublishingMediaPublicOrigin } from "@/lib/clipstitchr/publishing/media/gateway/normalizePublishingMediaPublicOrigin";
import { parsePublishingMediaObjectIdentity } from "@/lib/clipstitchr/publishing/media/gateway/parsePublishingMediaObjectIdentity";
import { readPublishingMediaHeadIdentity } from "@/lib/clipstitchr/publishing/media/gateway/readPublishingMediaHeadIdentity";
import { sealPublishingMediaGatewayToken } from "@/lib/clipstitchr/publishing/media/gateway/sealPublishingMediaGatewayToken";

export function createPublishingMediaUrlSigner({
  bucketName,
  createGrantKeyBytes = () => randomBytes(16),
  createInitializationVector,
  headClient,
  nowEpochMs = Date.now,
  publicOrigin,
  tokenSecret,
}: CreatePublishingMediaUrlSignerOptions): PublishingMediaUrlSigner {
  const normalizedBucketName = bucketName.trim();
  const normalizedPublicOrigin =
    normalizePublishingMediaPublicOrigin(publicOrigin);

  if (!normalizedBucketName) {
    throw new Error("Publishing media requires an R2 bucket.");
  }

  return {
    async sign(request) {
      if (
        !Number.isSafeInteger(request.sizeBytes) ||
        request.sizeBytes < 1 ||
        !Number.isSafeInteger(request.requestedValiditySeconds) ||
        request.requestedValiditySeconds < 60 ||
        request.requestedValiditySeconds > 7_200 ||
        !/^pmq_[A-Za-z0-9_-]{43}$/.test(request.quotaIdentity)
      ) {
        throw new PublishingMediaValidationError(
          "invalid_metadata",
          "Publishing media grant metadata is invalid.",
        );
      }

      const expectedIdentity = parsePublishingMediaObjectIdentity(
        request.version,
      );
      let head;

      try {
        head = await headClient.send(
          new HeadObjectCommand({
            Bucket: normalizedBucketName,
            Key: request.objectKey,
          }),
        );
      } catch {
        throw new PublishingMediaValidationError(
          "invalid_metadata",
          "The publishing media object is no longer available.",
        );
      }

      const actualIdentity = readPublishingMediaHeadIdentity(head);
      const actualContentType = head.ContentType?.trim().toLowerCase();

      if (
        head.ContentLength !== request.sizeBytes ||
        actualContentType !== request.contentType.trim().toLowerCase() ||
        (request.checksum && request.checksum !== actualIdentity.checksum) ||
        (expectedIdentity.versionId &&
          expectedIdentity.versionId !== actualIdentity.versionId) ||
        (expectedIdentity.etag && expectedIdentity.etag !== actualIdentity.etag)
      ) {
        throw new PublishingMediaValidationError(
          "invalid_metadata",
          "The publishing media object changed before its fetch grant was created.",
        );
      }

      if (!actualIdentity.versionId && !actualIdentity.etag) {
        throw new PublishingMediaValidationError(
          "missing_immutable_identity",
          "Publishing media requires an R2 VersionId or ETag.",
        );
      }

      const grantKeyBytes = createGrantKeyBytes();

      if (grantKeyBytes.byteLength !== 16) {
        throw new Error("Publishing media grant key generation failed.");
      }

      const issuedAtEpochMs = nowEpochMs();
      const expiresAtEpochMs =
        issuedAtEpochMs + request.requestedValiditySeconds * 1_000;
      const token = sealPublishingMediaGatewayToken(
        {
          audience: normalizedPublicOrigin,
          ...(actualIdentity.checksum
            ? { checksum: actualIdentity.checksum }
            : {}),
          contentType: actualContentType,
          ...(actualIdentity.etag ? { etag: actualIdentity.etag } : {}),
          expiresAtEpochMs,
          grantKey: `pmg_${grantKeyBytes.toString("base64url")}`,
          issuedAtEpochMs,
          objectKey: request.objectKey,
          provider: request.provider,
          quotaIdentity: request.quotaIdentity,
          schema: 1,
          sizeBytes: request.sizeBytes,
          ...(actualIdentity.versionId
            ? { versionId: actualIdentity.versionId }
            : {}),
        },
        tokenSecret,
        createInitializationVector,
      );

      return Object.freeze({
        expiresAtEpochMs,
        supportsGet: true,
        supportsHead: true,
        supportsNoRedirectFetch: true,
        supportsRange: true,
        url: `${normalizedPublicOrigin}/api/publishing/media/${token}`,
      });
    },
  };
}
