import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { SwaprOutputMetadata } from "@/lib/clipstitchr/types/SwaprOutputMetadata";

type VideoClipBadgeLabelInput = {
  clipType: ClipType;
  tags?: string[];
  swaprMetadata?: SwaprOutputMetadata;
};

export function getVideoClipBadgeLabel(clip: VideoClipBadgeLabelInput) {
  if (clip.swaprMetadata?.source === "swapr") {
    return "SWAP";
  }

  if (clip.tags?.some((tag) => tag.toLowerCase() === "clipr")) {
    return "CLIPR";
  }

  return clip.clipType.toUpperCase();
}
