import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import { createDefaultSwiprTextOverlay } from "@/lib/clipstitchr/utils/createDefaultSwiprTextOverlay";
import { createId } from "@/lib/clipstitchr/utils/createId";

export function createSwiprDraftSlides({
  backgroundIds,
  texts,
}: {
  backgroundIds: string[];
  texts: string[];
}): SwiprSlide[] {
  return texts.map((text, index) => ({
    backgroundId: backgroundIds[index % backgroundIds.length],
    id: createId(),
    textOverlay: {
      ...createDefaultSwiprTextOverlay(index + 1),
      text,
    },
  }));
}
