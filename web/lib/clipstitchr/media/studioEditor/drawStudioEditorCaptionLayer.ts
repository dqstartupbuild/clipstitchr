import { drawStudioEditorTextBlock } from "@/lib/clipstitchr/media/studioEditor/drawStudioEditorTextBlock";
import { getStudioEditorActiveCaptionText } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveCaptionText";
import type { StudioEditorCaptionLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCaptionLayer";

type DrawStudioEditorCaptionLayerOptions = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  layer: StudioEditorCaptionLayer;
  timelineSeconds: number;
};

export function drawStudioEditorCaptionLayer({
  canvas,
  context,
  layer,
  timelineSeconds,
}: DrawStudioEditorCaptionLayerOptions) {
  const text = getStudioEditorActiveCaptionText(layer, timelineSeconds);

  if (!text) {
    return;
  }

  context.save();
  drawStudioEditorTextBlock({
    centerX: canvas.width / 2,
    centerY: canvas.height * layer.style.positionYRatio,
    context,
    maxWidth: canvas.width * layer.style.maxWidthRatio,
    style: layer.style.text,
    text,
  });
  context.restore();
}
