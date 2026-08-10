import type { SocialPublishingScheduleMediaFile } from "@/lib/clipstitchr/types/SocialPublishingScheduleMediaFile";
import { getSocialPublishingMediaFallbackMimeType } from "@/lib/clipstitchr/utils/getSocialPublishingMediaFallbackMimeType";

export function createSocialPublishingMediaUploadBlob({
  blob,
  mediaKind,
}: SocialPublishingScheduleMediaFile) {
  return blob.type
    ? blob
    : new Blob([blob], {
        type: getSocialPublishingMediaFallbackMimeType(mediaKind),
      });
}
