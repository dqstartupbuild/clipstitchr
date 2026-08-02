import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { SWIPR_STATIC_DURATION } from "@/lib/clipstitchr/constants/swiprStaticDuration";
import { drawTextOverlay } from "@/lib/clipstitchr/media/drawTextOverlay";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";

type SwiprSlideBackgroundImage = CanvasImageSource & {
  naturalHeight: number;
  naturalWidth: number;
};

export function drawSwiprSlideToCanvas(
  context: CanvasRenderingContext2D,
  background: SwiprSlideBackgroundImage,
  slide: SwiprSlide,
) {
  const scale = Math.max(
    TIKTOK_OUTPUT_WIDTH / background.naturalWidth,
    TIKTOK_OUTPUT_HEIGHT / background.naturalHeight,
  );
  const width = background.naturalWidth * scale;
  const height = background.naturalHeight * scale;
  const x = (TIKTOK_OUTPUT_WIDTH - width) / 2;
  const y = (TIKTOK_OUTPUT_HEIGHT - height) / 2;

  context.clearRect?.(0, 0, TIKTOK_OUTPUT_WIDTH, TIKTOK_OUTPUT_HEIGHT);
  context.drawImage(background, x, y, width, height);

  if (slide.textOverlay.text.trim()) {
    drawTextOverlay(
      context,
      clampTextOverlay(slide.textOverlay, SWIPR_STATIC_DURATION),
      0,
    );
  }
}
