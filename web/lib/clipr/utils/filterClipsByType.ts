import type { ClipType } from "@/lib/clipr/types/ClipType";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

export function filterClipsByType(clips: VideoClip[], clipType: ClipType) {
  return clips.filter((clip) => clip.clipType === clipType);
}
