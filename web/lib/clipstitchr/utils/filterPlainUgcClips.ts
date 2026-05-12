import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function filterPlainUgcClips(clips: VideoClipMetadata[]) {
  return clips.filter(
    (clip) =>
      clip.clipType === "ugc" &&
      !clip.swaprMetadata?.source &&
      !clip.cliprMetadata,
  );
}
