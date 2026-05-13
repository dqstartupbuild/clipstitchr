import type { LongrClipSegment } from "@/lib/clipstitchr/types/LongrClipSegment";
import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type LongrVideo = {
  id: string;
  name: string;
  clipSegments: LongrClipSegment[];
  musicClips?: LongrMusicClip[];
  longrObject: R2ObjectReference;
  blob: Blob;
  posterObject?: R2ObjectReference;
  posterBlob?: Blob;
  posterVersion?: number;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  duration: number;
  createdAt: string;
};
