import { getStudioEditorCoverSize } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorCoverSize";
import { getStudioEditorTransitionProgress } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorTransitionProgress";
import type { StudioEditorImageLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorImageLayer";
import type { StudioEditorVideoLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVideoLayer";

type DrawStudioEditorVisualMediaOptions = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  layer: StudioEditorVideoLayer | StudioEditorImageLayer;
  media: CanvasImageSource;
  mediaWidth: number;
  mediaHeight: number;
  timelineSeconds: number;
};

export function drawStudioEditorVisualMedia({
  canvas,
  context,
  layer,
  media,
  mediaWidth,
  mediaHeight,
  timelineSeconds,
}: DrawStudioEditorVisualMediaOptions) {
  const transitionProgress = getStudioEditorTransitionProgress(
    layer,
    timelineSeconds,
  );
  const sourceX = layer.crop.left * mediaWidth;
  const sourceY = layer.crop.top * mediaHeight;
  const sourceWidth =
    mediaWidth * Math.max(0.001, 1 - layer.crop.left - layer.crop.right);
  const sourceHeight =
    mediaHeight * Math.max(0.001, 1 - layer.crop.top - layer.crop.bottom);
  const coverSize = getStudioEditorCoverSize(
    sourceWidth,
    sourceHeight,
    canvas.width,
    canvas.height,
  );

  context.save();
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.clip();

  if (
    layer.transitionIn.kind === "dipToBlack" ||
    layer.transitionIn.kind === "dipToWhite"
  ) {
    context.fillStyle =
      layer.transitionIn.kind === "dipToBlack" ? "#000000" : "#ffffff";
    context.globalAlpha = 1 - transitionProgress;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.translate(
    canvas.width / 2 + layer.transform.positionX,
    canvas.height / 2 + layer.transform.positionY,
  );
  context.rotate((layer.transform.rotationDegrees * Math.PI) / 180);
  context.scale(layer.transform.scaleX, layer.transform.scaleY);
  context.globalAlpha = layer.transform.opacity * transitionProgress;
  context.drawImage(
    media,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -coverSize.width / 2,
    -coverSize.height / 2,
    coverSize.width,
    coverSize.height,
  );
  context.restore();
}
