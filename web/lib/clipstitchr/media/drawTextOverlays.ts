import { drawTextOverlay } from "@/lib/clipstitchr/media/drawTextOverlay";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

type TextOverlayCanvasContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export function drawTextOverlays(
  context: TextOverlayCanvasContext,
  textOverlays: TextOverlay[],
  currentTime: number,
) {
  textOverlays.forEach((textOverlay) => {
    drawTextOverlay(context, textOverlay, currentTime);
  });
}
