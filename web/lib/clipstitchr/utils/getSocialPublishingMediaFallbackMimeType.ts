import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";

export function getSocialPublishingMediaFallbackMimeType(
  mediaKind: SocialPublishingMediaKind,
) {
  return mediaKind === "image" ? "image/png" : "video/mp4";
}
