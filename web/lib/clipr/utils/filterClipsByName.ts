import type { VideoClip } from "@/lib/clipr/types/VideoClip";

export function filterClipsByName(clips: VideoClip[], searchQuery: string) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return clips;
  }

  return clips.filter((clip) =>
    clip.name.toLowerCase().includes(normalizedSearchQuery),
  );
}
