import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { getClipCanUseInSwapr } from "@/lib/clipstitchr/utils/getClipCanUseInSwapr";

export function filterSwaprSourceClips(clips: VideoClipMetadata[]) {
  return clips.filter(getClipCanUseInSwapr);
}
