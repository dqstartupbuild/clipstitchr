import { HeadObjectCommand } from "@aws-sdk/client-s3";
import type { PublishingMediaHeadClient } from "@/lib/clipstitchr/publishing/media/server/PublishingMediaHeadClient";
import type { SwipePublishingBackgroundIdentity } from "@/lib/clipstitchr/publishing/media/SwipePublishingBackgroundIdentity";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type GetSwipePublishingBackgroundIdentityOptions = {
  backgroundId: string;
  bucketName: string;
  headClient: PublishingMediaHeadClient;
  object: R2ObjectReference;
  ownerId: string;
};

export async function getSwipePublishingBackgroundIdentity({
  backgroundId,
  bucketName,
  headClient,
  object,
  ownerId,
}: GetSwipePublishingBackgroundIdentityOptions): Promise<SwipePublishingBackgroundIdentity> {
  assertR2ObjectKeyBelongsToUser(object.key, ownerId);

  const head = await headClient.send(
    new HeadObjectCommand({
      Bucket: bucketName,
      Key: object.key,
    }),
  );
  const contentType = head.ContentType?.trim().toLowerCase();

  if (
    head.ContentLength !== object.size ||
    contentType !== object.contentType.trim().toLowerCase()
  ) {
    throw new Error("A saved Swipe background no longer matches R2.");
  }

  const sha256 =
    head.ChecksumSHA256?.trim() ||
    head.Metadata?.["checksum-sha256"]?.trim() ||
    head.Metadata?.sha256?.trim();
  const versionId = head.VersionId?.trim();
  const etag = head.ETag?.trim();
  const version =
    versionId || etag
      ? [
          ...(versionId ? [`version:${versionId}`] : []),
          ...(etag ? [`etag:${etag}`] : []),
        ].join("|")
      : undefined;

  if (!sha256 && !version) {
    throw new Error("A saved Swipe background has no immutable R2 identity.");
  }

  return {
    ...(sha256 ? { checksum: `sha256:${sha256}` } : {}),
    contentType: contentType!,
    id: backgroundId,
    objectKey: object.key,
    sizeBytes: object.size,
    ...(version ? { version } : {}),
  };
}
