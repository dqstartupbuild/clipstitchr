import type { ClipType } from "@/lib/clipr/types/ClipType";

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
  hasAudio: boolean;
  createdAt: string;
  updatedAt: string;
};
