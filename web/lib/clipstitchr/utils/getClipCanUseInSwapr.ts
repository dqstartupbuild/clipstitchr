import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function getClipCanUseInSwapr(
  clip: Pick<VideoClipMetadata, "clipType" | "swaprMetadata">,
) {
  return clip.clipType === "ugc" && clip.swaprMetadata?.source !== "swapr";
}
