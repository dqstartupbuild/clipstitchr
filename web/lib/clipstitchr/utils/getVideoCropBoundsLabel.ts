import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import { getDefaultVideoCropBounds } from "@/lib/clipstitchr/utils/getDefaultVideoCropBounds";
import { getVideoCropBoundsIsNeutral } from "@/lib/clipstitchr/utils/getVideoCropBoundsIsNeutral";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function getVideoCropBoundsLabel(cropBounds?: VideoCropBounds | null) {
  if (getVideoCropBoundsIsNeutral(cropBounds)) {
    return "None";
  }

  const bounds = getDefaultVideoCropBounds({
    defaultCropBounds: cropBounds ?? undefined,
  });

  return `T ${formatPercent(bounds.top)} . B ${formatPercent(bounds.bottom)} . L ${formatPercent(bounds.left)} . R ${formatPercent(bounds.right)}`;
}
