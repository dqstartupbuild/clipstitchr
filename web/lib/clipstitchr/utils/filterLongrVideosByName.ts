import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";

export function filterLongrVideosByName(
  longrVideos: LongrVideo[],
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
