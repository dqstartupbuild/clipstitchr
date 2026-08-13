import type { StudioEditorLayer } from "../../types/studioEditor/StudioEditorLayer";

export function clampStudioEditorLayerDurations(
  layer: StudioEditorLayer,
  durationSeconds: number,
): StudioEditorLayer {
  if (
    layer.kind === "video" ||
    layer.kind === "voice" ||
    layer.kind === "music"
  ) {
    const fadeInSeconds = Math.min(layer.audio.fadeInSeconds, durationSeconds);
    const fadeOutSeconds = Math.min(
      layer.audio.fadeOutSeconds,
      Math.max(0, durationSeconds - fadeInSeconds),
    );
    const audio = { ...layer.audio, fadeInSeconds, fadeOutSeconds };
    if (layer.kind === "video") {
      return {
        ...layer,
        durationSeconds,
        audio,
        transitionIn: {
          ...layer.transitionIn,
          durationSeconds: Math.min(
            layer.transitionIn.durationSeconds,
            durationSeconds,
          ),
        },
      };
    }
    return { ...layer, durationSeconds, audio };
  }
  if (layer.kind === "image" || layer.kind === "text") {
    return {
      ...layer,
      durationSeconds,
      transitionIn: {
        ...layer.transitionIn,
        durationSeconds: Math.min(
          layer.transitionIn.durationSeconds,
          durationSeconds,
        ),
      },
    };
  }
  return {
    ...layer,
    durationSeconds,
    cues: layer.cues
      .filter((cue) => cue.startSeconds < durationSeconds)
      .map((cue) => ({
        ...cue,
        endSeconds: Math.min(cue.endSeconds, durationSeconds),
      })),
  };
}
