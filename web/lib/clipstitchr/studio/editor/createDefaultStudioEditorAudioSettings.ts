import type { StudioEditorAudioSettings } from "../../types/studioEditor/StudioEditorAudioSettings";

export function createDefaultStudioEditorAudioSettings(): StudioEditorAudioSettings {
  return { volume: 1, muted: false, fadeInSeconds: 0, fadeOutSeconds: 0 };
}
