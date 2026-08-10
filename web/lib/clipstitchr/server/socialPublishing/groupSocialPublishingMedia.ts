import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";
import type { SocialPublishingUploadedMedia } from "@/lib/clipstitchr/types/SocialPublishingUploadedMedia";

export function groupSocialPublishingMedia(
  mediaFiles: SocialPublishingUploadedMedia[],
) {
  const mediaIds: string[] = [];
  const customMediaIdsByPlatform: Partial<
    Record<SocialPublishingPlatform, string[]>
  > = {};

  mediaFiles.forEach((mediaFile) => {
    if (!mediaFile.customPlatform) {
      mediaIds.push(mediaFile.mediaId);
      return;
    }

    customMediaIdsByPlatform[mediaFile.customPlatform] = [
      ...(customMediaIdsByPlatform[mediaFile.customPlatform] ?? []),
      mediaFile.mediaId,
    ];
  });

  if (!mediaIds.length) {
    throw new Error("Choose default media before scheduling.");
  }

  return { customMediaIdsByPlatform, mediaIds };
}
