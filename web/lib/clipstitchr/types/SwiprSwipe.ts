import type { SwiprProductSourceType } from "@/lib/clipstitchr/types/SwiprProductSourceType";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";

export type SwiprSwipe = {
  id: string;
  name: string;
  productSourceType: SwiprProductSourceType;
  productSourceId: string;
  productContext: string;
  productName: string;
  backgroundId: string;
  slides: SwiprSlide[];
  createdAt: string;
  updatedAt: string;
};
