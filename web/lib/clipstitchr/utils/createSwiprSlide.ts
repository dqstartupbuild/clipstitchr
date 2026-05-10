import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import { createDefaultSwiprTextOverlay } from "@/lib/clipstitchr/utils/createDefaultSwiprTextOverlay";
import { createId } from "@/lib/clipstitchr/utils/createId";

export function createSwiprSlide(index: number): SwiprSlide {
  return {
    id: createId(),
    textOverlay: createDefaultSwiprTextOverlay(index + 1),
  };
}
