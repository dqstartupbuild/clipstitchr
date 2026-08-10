import { createSocialPublishingMediaUploadDescriptor } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingMediaUploadDescriptor";
import type { SocialPublishingUploadedMedia } from "@/lib/clipstitchr/types/SocialPublishingUploadedMedia";

type CreateSocialPublishingUploadedMediaOptions = {
  mediaId: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
};

export function createSocialPublishingUploadedMedia({
  mediaId,
  mimeType,
  name,
  sizeBytes,
}: CreateSocialPublishingUploadedMediaOptions): SocialPublishingUploadedMedia {
  const normalizedMediaId = mediaId.trim();

  if (!normalizedMediaId) {
    throw new Error("Unable to prepare this media upload.");
  }

  return {
    ...createSocialPublishingMediaUploadDescriptor({
      mimeType,
      name,
      sizeBytes,
    }),
    mediaId: normalizedMediaId,
  };
}
