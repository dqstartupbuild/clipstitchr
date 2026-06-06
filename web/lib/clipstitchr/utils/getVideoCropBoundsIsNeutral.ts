import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import { areVideoCropBoundsEqual } from "@/lib/clipstitchr/utils/areVideoCropBoundsEqual";
import { getDefaultVideoCropBounds } from "@/lib/clipstitchr/utils/getDefaultVideoCropBounds";

export function getVideoCropBoundsIsNeutral(cropBounds?: VideoCropBounds | null) {
  return areVideoCropBoundsEqual(
    getDefaultVideoCropBounds(),
    getDefaultVideoCropBounds({ defaultCropBounds: cropBounds ?? undefined }),
  );
}
