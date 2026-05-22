import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";

export function getSwiprSlideBackgroundId(
  slide: SwiprSlide,
  fallbackBackgroundId: string,
) {
  return slide.backgroundId ?? fallbackBackgroundId;
}
