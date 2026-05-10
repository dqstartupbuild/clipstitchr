import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import { createSwiprSlide } from "@/lib/clipstitchr/utils/createSwiprSlide";
import { getClampedSwiprSlideCount } from "@/lib/clipstitchr/utils/getClampedSwiprSlideCount";

export function resizeSwiprSlides(
  slides: SwiprSlide[],
  nextCount: number,
): SwiprSlide[] {
  const clampedCount = getClampedSwiprSlideCount(nextCount);

  if (slides.length >= clampedCount) {
    return slides.slice(0, clampedCount);
  }

  return [
    ...slides,
    ...Array.from({ length: clampedCount - slides.length }, (_, index) =>
      createSwiprSlide(slides.length + index),
    ),
  ];
}
