import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function getUseInSwaprClipHref(clip: VideoClipMetadata) {
  return `/dashboard/swapr?clipId=${encodeURIComponent(clip.id)}`;
}
