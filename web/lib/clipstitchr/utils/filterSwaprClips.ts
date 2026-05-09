import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function filterSwaprClips(clips: VideoClipMetadata[]) {
  return clips.filter((clip) => clip.swaprMetadata?.source === "swapr");
}
