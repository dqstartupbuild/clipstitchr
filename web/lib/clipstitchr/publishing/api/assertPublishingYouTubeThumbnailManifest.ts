import type { PublishingResolvedMediaManifest } from "@/lib/clipstitchr/publishing/api/PublishingResolvedMediaManifest";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

const YOUTUBE_THUMBNAIL_MAX_BYTES = 2_097_152;

export function assertPublishingYouTubeThumbnailManifest(
  manifest: PublishingResolvedMediaManifest,
): void {
  const mediaObject = manifest.objects[0];
  const contentType = mediaObject?.contentType
    .split(";", 1)[0]
    .trim()
    .toLowerCase();

  if (
    manifest.objects.length !== 1 ||
    !mediaObject ||
    (contentType !== "image/jpeg" && contentType !== "image/png") ||
    mediaObject.byteLength > YOUTUBE_THUMBNAIL_MAX_BYTES
  ) {
    throw new PublishingProxyRequestError(422, "invalid_youtube_thumbnail");
  }
}
