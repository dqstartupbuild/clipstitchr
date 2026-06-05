import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function mergeVideoClipMetadataById(
  clips: VideoClipMetadata[],
): VideoClipMetadata[] {
  const clipsById = new Map<string, VideoClipMetadata>();

  for (const clip of clips) {
    clipsById.set(clip.id, clip);
  }

  return [...clipsById.values()];
}
