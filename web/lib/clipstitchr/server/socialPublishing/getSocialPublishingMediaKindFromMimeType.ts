import { normalizeSocialPublishingMediaMimeType } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingMediaMimeType";
import { socialPublishingImageMimeTypes } from "@/lib/clipstitchr/server/socialPublishing/socialPublishingImageMimeTypes";
import { socialPublishingVideoMimeTypes } from "@/lib/clipstitchr/server/socialPublishing/socialPublishingVideoMimeTypes";
import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";

export function getSocialPublishingMediaKindFromMimeType(
  mimeType: string,
): SocialPublishingMediaKind | null {
  const normalizedMimeType = normalizeSocialPublishingMediaMimeType(mimeType);

  if (socialPublishingImageMimeTypes.includes(normalizedMimeType)) {
    return "image";
  }

  if (socialPublishingVideoMimeTypes.includes(normalizedMimeType)) {
    return "video";
  }

  return null;
}
