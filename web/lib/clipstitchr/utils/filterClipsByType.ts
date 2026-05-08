import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

export function filterClipsByType(clips: VideoClip[], clipType: ClipType) {
  return clips.filter((clip) => clip.clipType === clipType);
}
