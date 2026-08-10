import type { SocialPublishingUploadedMedia } from "@/lib/clipstitchr/types/SocialPublishingUploadedMedia";

export function getSocialPublishingUploadedMediaSizeBytes(
  mediaFiles: SocialPublishingUploadedMedia[],
) {
  return mediaFiles.reduce((total, mediaFile) => total + mediaFile.sizeBytes, 0);
}
