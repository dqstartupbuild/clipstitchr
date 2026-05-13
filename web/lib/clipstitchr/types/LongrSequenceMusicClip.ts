import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";

export type LongrSequenceMusicClip = LongrMusicClip & {
  blob: Blob;
};
