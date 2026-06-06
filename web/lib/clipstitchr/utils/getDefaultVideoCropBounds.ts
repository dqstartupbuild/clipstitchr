import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";
import { clampVideoCropBounds } from "@/lib/clipstitchr/utils/clampVideoCropBounds";

export function getDefaultVideoCropBounds(
  clip?: Pick<VideoClipMetadata, "defaultCropBounds"> | null,
): VideoCropBounds {
  return clampVideoCropBounds(
    clip?.defaultCropBounds ?? {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    },
  );
}
