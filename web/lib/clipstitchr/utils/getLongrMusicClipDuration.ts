import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";

export function getLongrMusicClipDuration(clip: LongrMusicClip) {
  return Math.max(0, clip.sourceEndSeconds - clip.sourceStartSeconds);
}
