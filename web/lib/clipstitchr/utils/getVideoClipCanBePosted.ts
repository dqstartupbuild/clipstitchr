import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function getVideoClipCanBePosted(clip: VideoClipMetadata) {
  return (
    Boolean(clip.cliprMetadata) &&
    (!clip.cliprMetadata?.generationMode ||
      clip.cliprMetadata.generationMode === "script")
  );
}
