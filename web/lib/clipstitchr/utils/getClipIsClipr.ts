import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

export function getClipIsClipr(clip: VideoClipMetadata) {
  return Boolean(clip.tags?.some((tag) => tag.toLowerCase() === "clipr"));
}
