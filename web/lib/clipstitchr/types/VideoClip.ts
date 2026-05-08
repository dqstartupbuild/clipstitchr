import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { SwaprOutputMetadata } from "@/lib/clipstitchr/types/SwaprOutputMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

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
  swaprMetadata?: SwaprOutputMetadata;
  createdAt: string;
  updatedAt: string;
};
