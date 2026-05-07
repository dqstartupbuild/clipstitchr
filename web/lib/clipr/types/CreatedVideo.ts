import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";

export type CreatedVideo = {
  id: string;
  name: string;
  ugcClipId: string;
  demoClipId: string;
  ugcClipName: string;
  demoClipName: string;
  blob: Blob;
  posterBlob?: Blob;
  posterVersion?: number;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  duration: number;
  textOverlay?: TextOverlay;
  createdAt: string;
};
