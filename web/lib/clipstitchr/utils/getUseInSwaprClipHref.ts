import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { getClipCanUseInSwapr } from "@/lib/clipstitchr/utils/getClipCanUseInSwapr";

export function getUseInSwaprClipHref(clip: VideoClipMetadata) {
  if (!getClipCanUseInSwapr(clip)) {
    return "/dashboard/swapr";
  }

  return `/dashboard/swapr?clipId=${encodeURIComponent(clip.id)}`;
}
