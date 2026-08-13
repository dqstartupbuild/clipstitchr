import type { StudioClipsSource } from "../../lib/clipstitchr/types/studioClips/StudioClipsSource";
import { assertStudioClipsProductUploadObjectKey } from "./assertStudioClipsProductUploadObjectKey";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "./studioClipsPersistenceLimits";
import { normalizeStudioClipsYouTubeUrl } from "./normalizeStudioClipsYouTubeUrl";

const inputContentTypes = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/x-matroska",
]);

export function normalizeStudioClipsSource(
  source: StudioClipsSource,
  ownerId: string,
  productId: string,
): StudioClipsSource {
  if (source.kind === "youtube") {
    return { kind: "youtube", url: normalizeStudioClipsYouTubeUrl(source.url) };
  }
  const contentType = source.contentType.toLowerCase().split(";", 1)[0];
  if (!inputContentTypes.has(contentType)) {
    throw new Error("That source video format is not supported.");
  }
  if (
    !Number.isInteger(source.sizeBytes) ||
    source.sizeBytes <= 0 ||
    source.sizeBytes > STUDIO_CLIPS_PERSISTENCE_LIMITS.inputSizeBytes
  ) {
    throw new Error("That source video size is invalid.");
  }
  assertStudioClipsProductUploadObjectKey({
    kind: "media-source",
    objectKey: source.objectKey,
    ownerId,
    productId,
  });
  return {
    contentType,
    kind: "r2",
    objectKey: source.objectKey,
    sizeBytes: source.sizeBytes,
  };
}
