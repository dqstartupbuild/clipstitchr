import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function getClipCanUseInSwapr(
  clip: Pick<VideoClipMetadata, "clipType">,
) {
  return clip.clipType === "ugc";
}
