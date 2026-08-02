import type { PublishingMediaObject } from "@/lib/clipstitchr/publishing/media/PublishingMediaObject";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";

export function normalizePublishingMediaObject(
  mediaObject: PublishingMediaObject,
): PublishingMediaObject {
  if (typeof mediaObject.contentType !== "string") {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "The saved media content type is invalid.",
    );
  }

  const contentType = mediaObject.contentType
    .split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  const version = mediaObject.version?.trim();
  const checksum = mediaObject.checksum?.trim();

  if (
    !contentType ||
    (!contentType.startsWith("image/") && !contentType.startsWith("video/"))
  ) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "Publishing supports durable image and video objects only.",
    );
  }

  if (!Number.isSafeInteger(mediaObject.sizeBytes) || mediaObject.sizeBytes <= 0) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "The saved media byte size is invalid.",
    );
  }

  if (!version && !checksum) {
    throw new PublishingMediaValidationError(
      "missing_immutable_identity",
      "The saved media needs an object version or checksum before publishing.",
    );
  }

  for (const dimension of [mediaObject.width, mediaObject.height]) {
    if (
      dimension !== undefined &&
      (!Number.isSafeInteger(dimension) || dimension <= 0)
    ) {
      throw new PublishingMediaValidationError(
        "invalid_metadata",
        "The saved media dimensions are invalid.",
      );
    }
  }

  if (
    mediaObject.durationSeconds !== undefined &&
    (!Number.isFinite(mediaObject.durationSeconds) ||
      mediaObject.durationSeconds <= 0)
  ) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "The saved media duration is invalid.",
    );
  }

  for (const codec of [mediaObject.videoCodec, mediaObject.audioCodec]) {
    if (codec !== undefined && codec !== null && (!codec.trim() || codec.length > 64)) {
      throw new PublishingMediaValidationError(
        "invalid_metadata",
        "The saved media codec metadata is invalid.",
      );
    }
  }

  return Object.freeze({
    ...mediaObject,
    ...(checksum ? { checksum } : { checksum: undefined }),
    contentType,
    ...(mediaObject.audioCodec
      ? { audioCodec: mediaObject.audioCodec.trim().toLowerCase() }
      : {}),
    ...(mediaObject.videoCodec
      ? { videoCodec: mediaObject.videoCodec.trim().toLowerCase() }
      : {}),
    ...(version ? { version } : { version: undefined }),
  });
}
