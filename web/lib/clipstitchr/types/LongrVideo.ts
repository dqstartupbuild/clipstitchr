import type { LongrClipSegment } from "@/lib/clipstitchr/types/LongrClipSegment";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type LongrVideo = {
  id: string;
  name: string;
  clipSegments: LongrClipSegment[];
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
