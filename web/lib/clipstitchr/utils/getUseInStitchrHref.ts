import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function getUseInStitchrHref(clip: VideoClipMetadata) {
  const paramName = clip.clipType === "demo" ? "demoId" : "ugcId";

  return `/dashboard/stitchr?${paramName}=${encodeURIComponent(clip.id)}`;
}
