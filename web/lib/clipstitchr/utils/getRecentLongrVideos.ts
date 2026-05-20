import type { LongrVideoMetadata } from "@/lib/clipstitchr/types/LongrVideoMetadata";

export function getRecentLongrVideos(
  longrVideos: LongrVideoMetadata[],
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
