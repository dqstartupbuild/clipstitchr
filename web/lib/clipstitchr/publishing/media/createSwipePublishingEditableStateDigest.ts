import { createSha256HexDigest } from "@/lib/clipstitchr/crypto/createSha256HexDigest";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";

type SwipePublishingEditableState = {
  backgroundId: string;
  slides: SwiprSlide[];
};

export async function createSwipePublishingEditableStateDigest({
  backgroundId,
  slides,
}: SwipePublishingEditableState) {
  return await createSha256HexDigest(
    JSON.stringify({
      backgroundId,
      slides: slides.map((slide) => ({
        backgroundId: slide.backgroundId ?? null,
        id: slide.id,
        textOverlay: {
          backgroundColor: slide.textOverlay.backgroundColor ?? null,
          color: slide.textOverlay.color ?? null,
          endTime: slide.textOverlay.endTime,
          fontSize: slide.textOverlay.fontSize,
          id: slide.textOverlay.id ?? null,
          startTime: slide.textOverlay.startTime,
          strokeColor: slide.textOverlay.strokeColor ?? null,
          styleId: slide.textOverlay.styleId,
          text: slide.textOverlay.text,
          width: slide.textOverlay.width,
          x: slide.textOverlay.x,
          y: slide.textOverlay.y,
        },
      })),
    }),
  );
}
