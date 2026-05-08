import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export function getRecentStitches(
  stitches: Stitch[],
  limit: number,
) {
  return [...stitches]
    .sort(
      (firstStitch, secondStitch) =>
        new Date(secondStitch.createdAt).getTime() -
        new Date(firstStitch.createdAt).getTime(),
    )
    .slice(0, limit);
}
