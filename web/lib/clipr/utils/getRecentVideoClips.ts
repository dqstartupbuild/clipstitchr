import type { VideoClip } from "@/lib/clipr/types/VideoClip";

export function getRecentVideoClips(clips: VideoClip[], limit: number) {
  return [...clips]
    .sort(
      (firstClip, secondClip) =>
        new Date(secondClip.createdAt).getTime() -
        new Date(firstClip.createdAt).getTime(),
    )
    .slice(0, limit);
}
