import type { CSSProperties } from "react";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import { getDefaultVideoCropBounds } from "@/lib/clipstitchr/utils/getDefaultVideoCropBounds";

export function getVideoCropPreviewStyle(
  cropBounds?: VideoCropBounds | null,
): CSSProperties {
  const bounds = getDefaultVideoCropBounds({
    defaultCropBounds: cropBounds ?? undefined,
  });
  const visibleWidth = Math.max(0.1, 1 - bounds.left - bounds.right);
  const visibleHeight = Math.max(0.1, 1 - bounds.top - bounds.bottom);
  const scale = Math.max(1 / visibleWidth, 1 / visibleHeight);
  const cropCenterX = bounds.left + visibleWidth / 2;
  const cropCenterY = bounds.top + visibleHeight / 2;
  const left = 0.5 - cropCenterX * scale;
  const top = 0.5 - cropCenterY * scale;

  return {
    height: `${scale * 100}%`,
    left: `${left * 100}%`,
    objectFit: "fill",
    position: "absolute",
    top: `${top * 100}%`,
    width: `${scale * 100}%`,
  };
}
