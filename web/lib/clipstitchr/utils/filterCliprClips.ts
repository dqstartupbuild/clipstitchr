import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { getClipIsClipr } from "@/lib/clipstitchr/utils/getClipIsClipr";

export function filterCliprClips(clips: VideoClipMetadata[]) {
  return clips.filter(getClipIsClipr);
}
