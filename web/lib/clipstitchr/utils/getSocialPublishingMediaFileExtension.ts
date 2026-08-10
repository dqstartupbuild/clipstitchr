import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";

export function getSocialPublishingMediaFileExtension(
  mediaKind: SocialPublishingMediaKind,
) {
  return mediaKind === "image" ? "png" : "mp4";
}
