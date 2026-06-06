import {
  VIDEO_CROP_MAX_EDGE_INSET,
  VIDEO_CROP_MIN_VISIBLE_RATIO,
} from "@/lib/clipstitchr/constants/videoCropBounds";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import { clamp } from "@/lib/clipstitchr/utils/clamp";

function getSafeInset(value: number) {
  return Number.isFinite(value)
    ? clamp(value, 0, VIDEO_CROP_MAX_EDGE_INSET)
    : 0;
}

function clampOpposingInsets(first: number, second: number) {
  const maxCombinedInset = 1 - VIDEO_CROP_MIN_VISIBLE_RATIO;
  const totalInset = first + second;

  if (totalInset <= maxCombinedInset) {
    return [first, second] as const;
  }

  const scale = maxCombinedInset / totalInset;

  return [first * scale, second * scale] as const;
}

export function clampVideoCropBounds(
  cropBounds: VideoCropBounds,
): VideoCropBounds {
  const [top, bottom] = clampOpposingInsets(
    getSafeInset(cropBounds.top),
    getSafeInset(cropBounds.bottom),
  );
  const [left, right] = clampOpposingInsets(
    getSafeInset(cropBounds.left),
    getSafeInset(cropBounds.right),
  );

  return {
    bottom,
    left,
    right,
    top,
  };
}
