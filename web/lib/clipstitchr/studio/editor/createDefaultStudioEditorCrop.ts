import type { StudioEditorCrop } from "../../types/studioEditor/StudioEditorCrop";

export function createDefaultStudioEditorCrop(): StudioEditorCrop {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}
