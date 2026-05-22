import type { SwiprProductSourceType } from "@/lib/clipstitchr/types/SwiprProductSourceType";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type SwiprSwipe = {
  id: string;
  name: string;
  productSourceType: SwiprProductSourceType;
  productSourceId: string;
  productContext: string;
  productName: string;
  backgroundId: string;
  slides: SwiprSlide[];
  posterObject?: R2ObjectReference;
  posterBlob?: Blob;
  posterVersion?: number;
  createdAt: string;
  updatedAt: string;
};
