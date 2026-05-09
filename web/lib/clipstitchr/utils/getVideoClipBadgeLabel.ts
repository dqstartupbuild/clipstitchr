import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { SwaprOutputMetadata } from "@/lib/clipstitchr/types/SwaprOutputMetadata";

type VideoClipBadgeLabelInput = {
  clipType: ClipType;
  swaprMetadata?: SwaprOutputMetadata;
};

export function getVideoClipBadgeLabel(clip: VideoClipBadgeLabelInput) {
  if (clip.swaprMetadata?.source === "swapr") {
    return "SWAP";
  }

  return clip.clipType.toUpperCase();
}
