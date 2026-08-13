import type { StudioEditorAudioSettings } from "@/lib/clipstitchr/types/studioEditor/StudioEditorAudioSettings";

export function updateStudioEditorAudio(
  audio: StudioEditorAudioSettings,
  change: Partial<StudioEditorAudioSettings>,
  durationSeconds: number,
  onChange: (audio: StudioEditorAudioSettings) => void,
) {
  const next = { ...audio, ...change };
  if (next.fadeInSeconds + next.fadeOutSeconds > durationSeconds) {
    if ("fadeInSeconds" in change) {
      next.fadeOutSeconds = Math.max(0, durationSeconds - next.fadeInSeconds);
    } else {
      next.fadeInSeconds = Math.max(0, durationSeconds - next.fadeOutSeconds);
    }
  }
  onChange(next);
}
