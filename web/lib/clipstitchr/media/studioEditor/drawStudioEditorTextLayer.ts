import { drawStudioEditorTextBlock } from "@/lib/clipstitchr/media/studioEditor/drawStudioEditorTextBlock";
import { getStudioEditorTransitionProgress } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorTransitionProgress";
import type { StudioEditorTextLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorTextLayer";

type DrawStudioEditorTextLayerOptions = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  layer: StudioEditorTextLayer;
  timelineSeconds: number;
};

export function drawStudioEditorTextLayer({
  canvas,
  context,
  layer,
  timelineSeconds,
}: DrawStudioEditorTextLayerOptions) {
  context.save();
  context.translate(
    canvas.width / 2 + layer.transform.positionX,
    canvas.height / 2 + layer.transform.positionY,
  );
  context.rotate((layer.transform.rotationDegrees * Math.PI) / 180);
  context.scale(layer.transform.scaleX, layer.transform.scaleY);
  context.globalAlpha =
    layer.transform.opacity *
    getStudioEditorTransitionProgress(layer, timelineSeconds);
  drawStudioEditorTextBlock({
    centerX: 0,
    centerY: 0,
    context,
    maxWidth: canvas.width * 0.82,
    style: layer.style,
    text: layer.text,
  });
  context.restore();
}
