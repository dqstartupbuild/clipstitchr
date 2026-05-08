import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type Stitch = {
  id: string;
  name: string;
  ugcClipId: string;
  demoClipId: string;
  ugcClipName: string;
  demoClipName: string;
  ugcTrimRange?: VideoTrimRange;
  demoTrimRange?: VideoTrimRange;
  stitchObject: R2ObjectReference;
  blob: Blob;
  posterObject?: R2ObjectReference;
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
