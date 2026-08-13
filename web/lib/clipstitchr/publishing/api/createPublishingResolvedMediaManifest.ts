import "server-only";

import type { PublishingResolvedMediaManifest } from "@/lib/clipstitchr/publishing/api/PublishingResolvedMediaManifest";
import type { PublishingResolvedMediaObjectManifest } from "@/lib/clipstitchr/publishing/api/PublishingResolvedMediaObjectManifest";
import { convertPublishingSha256Base64ToHex } from "@/lib/clipstitchr/publishing/api/convertPublishingSha256Base64ToHex";
import { createPublishingSha256Hex } from "@/lib/clipstitchr/publishing/api/createPublishingSha256Hex";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import type { ResolvedPublishingMediaSource } from "@/lib/clipstitchr/publishing/media/ResolvedPublishingMediaSource";

const DURABLE_OBJECT_VERSION_PATTERN =
  /^(?=.{1,1024}$)(?:(?:version|etag):[^|?#\u0000-\u001f\u007f]+)(?:\|(?:version|etag):[^|?#\u0000-\u001f\u007f]+)*$/u;

export function createPublishingResolvedMediaManifest(
  source: ResolvedPublishingMediaSource,
): PublishingResolvedMediaManifest {
  if (source.mediaObjects.length < 1 || source.mediaObjects.length > 20) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "Publishing media must contain between one and twenty durable objects.",
    );
  }

  const objects = source.mediaObjects.map(
    (mediaObject, orderedIndex): PublishingResolvedMediaObjectManifest => {
      const objectVersion = mediaObject.version?.trim();
      if (
        !objectVersion ||
        !DURABLE_OBJECT_VERSION_PATTERN.test(objectVersion)
      ) {
        throw new PublishingMediaValidationError(
          "missing_immutable_identity",
          "Publishing media requires a durable R2 version or ETag.",
        );
      }

      return Object.freeze({
        ...(mediaObject.audioCodec
          ? { audioCodec: mediaObject.audioCodec }
          : {}),
        byteLength: mediaObject.sizeBytes,
        checksum: convertPublishingSha256Base64ToHex(mediaObject.checksum),
        contentType: mediaObject.contentType,
        ...(mediaObject.durationSeconds === undefined
          ? {}
          : { durationSeconds: mediaObject.durationSeconds }),
        ...(mediaObject.hasAudio === undefined
          ? {}
          : { hasAudio: mediaObject.hasAudio }),
        ...(mediaObject.height === undefined
          ? {}
          : { height: mediaObject.height }),
        objectKey: mediaObject.objectKey,
        objectVersion,
        orderedIndex,
        ...(mediaObject.videoCodec
          ? { videoCodec: mediaObject.videoCodec }
          : {}),
        ...(mediaObject.width === undefined
          ? {}
          : { width: mediaObject.width }),
      });
    },
  );
  const sourceKind = source.kind === "library-media" ? "library" : source.kind;
  const contentChecksum = createPublishingSha256Hex(
    JSON.stringify(
      objects.map(({ byteLength, checksum, orderedIndex }) => ({
        byteLength,
        checksum,
        orderedIndex,
      })),
    ),
  );
  const sourceRevision = createPublishingSha256Hex(
    JSON.stringify({
      contentChecksum,
      objects,
      sourceKind,
      sourceRecordId: source.recordId,
    }),
  );

  return Object.freeze({
    contentChecksum,
    objects: Object.freeze(objects),
    sourceKind,
    sourceRecordId: source.recordId,
    sourceRevision,
  });
}
