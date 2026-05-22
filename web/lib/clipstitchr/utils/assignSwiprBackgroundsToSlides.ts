import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";

export function assignSwiprBackgroundsToSlides(
  slides: SwiprSlide[],
  backgroundIds: string[],
) {
  return slides.map((slide, index) => {
    const backgroundId = backgroundIds[index];

    return backgroundId ? { ...slide, backgroundId } : slide;
  });
}
