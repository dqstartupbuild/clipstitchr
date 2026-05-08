export type TextOverlayRenderContext = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
};

export function createTextOverlayRenderContext(
  width: number,
  height: number,
): TextOverlayRenderContext {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create a canvas renderer for text overlays.");
    }

    return { canvas, context };
  }

  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create a canvas renderer for text overlays.");
    }

    return { canvas, context };
  }

  throw new Error("Canvas rendering is unavailable in this environment.");
}
