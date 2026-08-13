import type { StudioEditorCanvasV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCanvasV1";

export function createStudioEditorRenderCanvas(canvasSettings: StudioEditorCanvasV1) {
  const canvas = document.createElement("canvas");
  canvas.width = canvasSettings.width;
  canvas.height = canvasSettings.height;
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("This browser cannot open the Studio canvas.");
  }

  return { canvas, context };
}
