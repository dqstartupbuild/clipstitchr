import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { getAssetSearchText } from "@/lib/clipstitchr/utils/getAssetSearchText";

export function filterClipsBySearchQuery(
  clips: VideoClipMetadata[],
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
