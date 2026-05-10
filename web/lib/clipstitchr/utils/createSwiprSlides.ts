import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import { createSwiprSlide } from "@/lib/clipstitchr/utils/createSwiprSlide";
import { getClampedSwiprSlideCount } from "@/lib/clipstitchr/utils/getClampedSwiprSlideCount";

export function createSwiprSlides(count: number): SwiprSlide[] {
  return Array.from({ length: getClampedSwiprSlideCount(count) }, (_, index) =>
    createSwiprSlide(index),
  );
}
