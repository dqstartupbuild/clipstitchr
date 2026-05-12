import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function filterNonSwaprClips(clips: VideoClipMetadata[]) {
  return clips.filter(
    (clip) => clip.swaprMetadata?.source !== "swapr" && !clip.cliprMetadata,
  );
}
