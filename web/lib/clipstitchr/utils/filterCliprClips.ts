import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function filterCliprClips(clips: VideoClipMetadata[]) {
  return clips.filter((clip) => Boolean(clip.cliprMetadata));
}
