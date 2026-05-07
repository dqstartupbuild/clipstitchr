import type { ClipType } from "@/lib/clipr/types/ClipType";
import type { VideoTrimRange } from "@/lib/clipr/types/VideoTrimRange";

export type VideoClip = {
  id: string;
  name: string;
  originalName: string;
  clipType: ClipType;
  blob: Blob;
  posterBlob?: Blob;
  posterVersion?: number;
  mimeType: string;
  sourceMimeType: string;
  size: number;
  originalSize: number;
  width: number;
  height: number;
  aspectRatio: number;
  duration: number;
  defaultTrimRange?: VideoTrimRange;
  hasAudio: boolean;
  createdAt: string;
  updatedAt: string;
};
