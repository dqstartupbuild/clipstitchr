import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export function filterStitchesByName(
  stitches: Stitch[],
  searchQuery: string,
) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return stitches;
  }

  return stitches.filter((stitch) =>
    stitch.name.toLowerCase().includes(normalizedSearchQuery),
  );
}
