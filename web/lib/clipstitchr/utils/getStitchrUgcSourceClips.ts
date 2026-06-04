import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function getStitchrUgcSourceClips(
  ugcClips: VideoClipMetadata[],
  cliprClips: VideoClipMetadata[],
  swaprClips: VideoClipMetadata[],
) {
  const clipsById = new Map<string, VideoClipMetadata>();

  for (const clip of [...ugcClips, ...cliprClips, ...swaprClips]) {
    clipsById.set(clip.id, clip);
  }

  return [...clipsById.values()];
}
