import type { CropRectangle } from "mediabunny";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import { getDefaultVideoCropBounds } from "@/lib/clipstitchr/utils/getDefaultVideoCropBounds";
import { getVideoCropBoundsIsNeutral } from "@/lib/clipstitchr/utils/getVideoCropBoundsIsNeutral";

export function getMediaBunnyCropRectangle({
  cropBounds,
  height,
  width,
}: {
  cropBounds?: VideoCropBounds | null;
  height: number;
  width: number;
}): CropRectangle | undefined {
  if (getVideoCropBoundsIsNeutral(cropBounds)) {
    return undefined;
  }

  const bounds = getDefaultVideoCropBounds({
    defaultCropBounds: cropBounds ?? undefined,
  });
  const left = Math.round(bounds.left * width);
  const top = Math.round(bounds.top * height);
  const cropWidth = Math.max(
    1,
    Math.round(width * (1 - bounds.left - bounds.right)),
  );
  const cropHeight = Math.max(
    1,
    Math.round(height * (1 - bounds.top - bounds.bottom)),
  );

  return {
    height: cropHeight,
    left,
    top,
    width: cropWidth,
  };
}
