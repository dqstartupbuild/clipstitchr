import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";

export function areVideoCropBoundsEqual(
  first: VideoCropBounds,
  second: VideoCropBounds,
) {
  return (
    first.bottom === second.bottom &&
    first.left === second.left &&
    first.right === second.right &&
    first.top === second.top
  );
}
