import type { StudioEditorTransition } from "../../types/studioEditor/StudioEditorTransition";

export function createDefaultStudioEditorTransition(): StudioEditorTransition {
  return { kind: "none", durationSeconds: 0 };
}
