import type { LongrVideoMetadata } from "@/lib/clipstitchr/types/LongrVideoMetadata";

export function filterLongrVideosByName(
  longrVideos: LongrVideoMetadata[],
  searchQuery: string,
) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return longrVideos;
  }

  return longrVideos.filter((longrVideo) =>
    longrVideo.name.toLowerCase().includes(normalizedSearchQuery),
  );
}
