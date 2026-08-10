import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";
import { getAssetDownloadFileName } from "@/lib/clipstitchr/utils/getAssetDownloadFileName";
import { getSocialPublishingMediaFileExtension } from "@/lib/clipstitchr/utils/getSocialPublishingMediaFileExtension";

export function getSocialPublishingMediaFileName(
  name: string,
  mediaKind: SocialPublishingMediaKind = "video",
) {
  return getAssetDownloadFileName(
    name || "clipstitchr-post",
    getSocialPublishingMediaFileExtension(mediaKind),
  );
}
