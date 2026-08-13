import type { StudioEditorCanvasV1 } from "../../types/studioEditor/StudioEditorCanvasV1";

export function createDefaultStudioEditorCanvas(): StudioEditorCanvasV1 {
  return {
    width: 1080,
    height: 1920,
    fps: 30,
    backgroundColor: "#000000",
  };
}
