import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";
import type { SocialPublishingUploadedMedia } from "@/lib/clipstitchr/types/SocialPublishingUploadedMedia";

export function resolveSocialPublishingMediaKindForUploadedMedia(
  mediaFiles: SocialPublishingUploadedMedia[],
): SocialPublishingMediaKind {
  const mediaKind = mediaFiles[0]?.mediaKind;

  if (!mediaKind || mediaFiles.some((mediaFile) => mediaFile.mediaKind !== mediaKind)) {
    throw new Error("Schedule either images or one video, not both.");
  }

  if (mediaKind === "video" && mediaFiles.length > 1) {
    throw new Error("Schedule one video at a time.");
  }

  return mediaKind;
}
