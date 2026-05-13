import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";

export function getRecentLongrVideos(
  longrVideos: LongrVideo[],
  limit: number,
) {
  return [...longrVideos]
    .sort(
      (firstVideo, secondVideo) =>
        new Date(secondVideo.createdAt).getTime() -
        new Date(firstVideo.createdAt).getTime(),
    )
    .slice(0, limit);
}
