import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { assertPublishingMediaObjectKeyOwnership } from "@/lib/clipstitchr/publishing/media/assertPublishingMediaObjectKeyOwnership";
import type { PublishingMediaObject } from "@/lib/clipstitchr/publishing/media/PublishingMediaObject";
import type { PublishingMediaSourceDescriptor } from "@/lib/clipstitchr/publishing/media/PublishingMediaSourceDescriptor";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import type { PublishingMediaHeadClient } from "@/lib/clipstitchr/publishing/media/server/PublishingMediaHeadClient";

type EnrichPublishingMediaObjectWithR2HeadOptions = {
  bucketName: string;
  descriptor: PublishingMediaSourceDescriptor;
  headClient: PublishingMediaHeadClient;
  mediaObject: PublishingMediaObject;
  ownerId: string;
};

export async function enrichPublishingMediaObjectWithR2Head({
  bucketName,
  descriptor,
  headClient,
  mediaObject,
  ownerId,
}: EnrichPublishingMediaObjectWithR2HeadOptions): Promise<PublishingMediaObject> {
  const normalizedBucketName = bucketName.trim();

  if (!normalizedBucketName) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "Publishing media requires an R2 bucket.",
    );
  }

  assertPublishingMediaObjectKeyOwnership(
    mediaObject.objectKey,
    ownerId,
    descriptor,
  );

  let head;

  try {
    head = await headClient.send(
      new HeadObjectCommand({
        Bucket: normalizedBucketName,
        Key: mediaObject.objectKey,
      }),
    );
  } catch {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "The saved media object could not be found in durable storage.",
    );
  }

  const expectedContentType = mediaObject.contentType.trim().toLowerCase();
  const actualContentType = head.ContentType?.trim().toLowerCase();

  if (
    !Number.isSafeInteger(head.ContentLength) ||
    head.ContentLength !== mediaObject.sizeBytes
  ) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "The durable media byte size no longer matches its saved record.",
    );
  }

  if (!actualContentType || actualContentType !== expectedContentType) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "The durable media content type no longer matches its saved record.",
    );
  }

  const versionId = head.VersionId?.trim();
  const etag = head.ETag?.trim();
  const sha256 =
    head.ChecksumSHA256?.trim() ||
    head.Metadata?.["checksum-sha256"]?.trim() ||
    head.Metadata?.sha256?.trim();
  const actualChecksum = sha256 ? `sha256:${sha256}` : undefined;
  const actualVersion =
    versionId || etag
      ? [
          ...(versionId ? [`version:${versionId}`] : []),
          ...(etag ? [`etag:${etag}`] : []),
        ].join("|")
      : undefined;

  if (mediaObject.checksum && mediaObject.checksum !== actualChecksum) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "The durable media checksum no longer matches its saved record.",
    );
  }

  if (
    mediaObject.version &&
    !mediaObject.version
      .split("|")
      .every((versionPart) => actualVersion?.split("|").includes(versionPart))
  ) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "The durable media version no longer matches its saved record.",
    );
  }

  if (!versionId && !etag && !sha256) {
    throw new PublishingMediaValidationError(
      "missing_immutable_identity",
      "The durable media object has no version, ETag, or checksum.",
    );
  }

  return {
    ...mediaObject,
    ...(actualChecksum ? { checksum: actualChecksum } : {}),
    contentType: actualContentType,
    ...(actualVersion ? { version: actualVersion } : {}),
  };
}
