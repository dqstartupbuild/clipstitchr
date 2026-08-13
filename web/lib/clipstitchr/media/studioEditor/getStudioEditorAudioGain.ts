import type { StudioEditorMusicLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMusicLayer";
import type { StudioEditorVideoLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVideoLayer";
import type { StudioEditorVoiceLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVoiceLayer";

export function getStudioEditorAudioGain(
  layer: StudioEditorVideoLayer | StudioEditorVoiceLayer | StudioEditorMusicLayer,
  localSeconds: number,
) {
  if (layer.audio.muted) {
    return 0;
  }

  const fadeInGain =
    layer.audio.fadeInSeconds > 0
      ? Math.min(1, Math.max(0, localSeconds / layer.audio.fadeInSeconds))
      : 1;
  const remainingSeconds = layer.durationSeconds - localSeconds;
  const fadeOutGain =
    layer.audio.fadeOutSeconds > 0
      ? Math.min(1, Math.max(0, remainingSeconds / layer.audio.fadeOutSeconds))
      : 1;

  return layer.audio.volume * Math.min(fadeInGain, fadeOutGain);
}
