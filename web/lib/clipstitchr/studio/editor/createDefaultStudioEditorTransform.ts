import type { StudioEditorTransform } from "../../types/studioEditor/StudioEditorTransform";

export function createDefaultStudioEditorTransform(): StudioEditorTransform {
  return {
    positionX: 0,
    positionY: 0,
    scaleX: 1,
    scaleY: 1,
    rotationDegrees: 0,
    opacity: 1,
  };
}
