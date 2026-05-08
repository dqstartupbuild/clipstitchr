import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import { getAssetSearchText } from "@/lib/clipstitchr/utils/getAssetSearchText";

export function filterClipsBySearchQuery(
  clips: VideoClip[],
  searchQuery: string,
) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return clips;
  }

  return clips.filter((clip) =>
    getAssetSearchText({
      ...clip,
      tags: [clip.clipType, ...(clip.tags ?? [])],
    }).includes(normalizedSearchQuery),
  );
}
