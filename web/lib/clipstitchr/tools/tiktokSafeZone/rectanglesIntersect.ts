import type { NormalizedRect } from "@/lib/clipstitchr/tools/tiktokSafeZone/NormalizedRect";

export function rectanglesIntersect(
  first: NormalizedRect,
  second: NormalizedRect,
) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}
