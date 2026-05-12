import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { SwiprBackgroundSource } from "@/lib/clipstitchr/types/SwiprBackgroundSource";

export type SwiprBackgroundAsset = {
  id: string;
  name: string;
  tags: string[];
  description?: string;
  details?: string;
  source: SwiprBackgroundSource;
  imageObject: R2ObjectReference;
  blob?: Blob;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  createdAt: string;
};
