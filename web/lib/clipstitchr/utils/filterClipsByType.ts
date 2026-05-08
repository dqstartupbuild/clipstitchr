import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function filterClipsByType(
  clips: VideoClipMetadata[],
  clipType: ClipType,
) {
  return clips.filter((clip) => clip.clipType === clipType);
}
