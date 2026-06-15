import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { CliprMetadata } from "@/lib/clipstitchr/types/CliprMetadata";
import type { SwaprOutputMetadata } from "@/lib/clipstitchr/types/SwaprOutputMetadata";

type VideoClipBadgeLabelInput = {
  clipType: ClipType;
  cliprMetadata?: CliprMetadata;
  isPosted?: boolean;
  swaprMetadata?: SwaprOutputMetadata;
};

export function getVideoClipBadgeLabel(clip: VideoClipBadgeLabelInput) {
  if (
    clip.isPosted &&
    clip.cliprMetadata &&
    (!clip.cliprMetadata.generationMode ||
      clip.cliprMetadata.generationMode === "script")
  ) {
    return "POSTED";
  }

  if (clip.cliprMetadata) {
    return "CLIP";
  }

  if (clip.swaprMetadata?.source === "swapr") {
    return "SWAP";
  }

  return clip.clipType.toUpperCase();
}
