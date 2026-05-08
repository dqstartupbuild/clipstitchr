import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function getRecentVideoClips(
  clips: VideoClipMetadata[],
  limit: number,
) {
  return [...clips]
    .sort(
      (firstClip, secondClip) =>
        new Date(secondClip.createdAt).getTime() -
        new Date(firstClip.createdAt).getTime(),
    )
    .slice(0, limit);
}
