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
  const outputWidth = context.canvas.width;
  const outputHeight = context.canvas.height;
  const scale = Math.max(
    outputWidth / background.naturalWidth,
    outputHeight / background.naturalHeight,
  );
  const width = background.naturalWidth * scale;
  const height = background.naturalHeight * scale;
  const x = (outputWidth - width) / 2;
  const y = (outputHeight - height) / 2;

  context.clearRect?.(0, 0, outputWidth, outputHeight);
  context.drawImage(background, x, y, width, height);

  if (slide.textOverlay.text.trim()) {
    drawTextOverlay(
      context,
      clampTextOverlay(slide.textOverlay, SWIPR_STATIC_DURATION),
      0,
    );
  }
}
