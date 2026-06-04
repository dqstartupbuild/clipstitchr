import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function findVideoClipMetadataById(
  clips: VideoClipMetadata[],
  id: string,
) {
  return clips.find((clip) => clip.id === id) ?? null;
}
