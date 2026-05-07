import type { CreatedVideo } from "@/lib/clipr/types/CreatedVideo";

export function filterCreatedVideosByName(
  createdVideos: CreatedVideo[],
  searchQuery: string,
) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return createdVideos;
  }

  return createdVideos.filter((createdVideo) =>
    createdVideo.name.toLowerCase().includes(normalizedSearchQuery),
  );
}
