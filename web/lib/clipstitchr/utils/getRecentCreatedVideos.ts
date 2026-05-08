import type { CreatedVideo } from "@/lib/clipstitchr/types/CreatedVideo";

export function getRecentCreatedVideos(
  createdVideos: CreatedVideo[],
  limit: number,
) {
  return [...createdVideos]
    .sort(
      (firstVideo, secondVideo) =>
        new Date(secondVideo.createdAt).getTime() -
        new Date(firstVideo.createdAt).getTime(),
    )
    .slice(0, limit);
}
