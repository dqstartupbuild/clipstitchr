import { getStudioEditorSafeSourceDuration } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSafeSourceDuration";
import type { StudioEditorLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorLayer";

export function normalizeStudioEditorUpdatedLayer(
  layer: StudioEditorLayer,
  fps: number,
): StudioEditorLayer {
  if (
    layer.kind !== "video" &&
    layer.kind !== "voice" &&
    layer.kind !== "music"
  ) {
    return layer;
  }

  const sourceRemaining =
    layer.sourceDurationSeconds - layer.sourceOffsetSeconds;
  const playbackSpeed = Math.min(
    layer.playbackSpeed,
    Math.max(0.25, sourceRemaining * fps),
  );
  const maximumDuration = sourceRemaining / playbackSpeed;
  const durationSeconds = Math.min(
    layer.durationSeconds,
    getStudioEditorSafeSourceDuration(maximumDuration, fps),
  );
  const fadeInSeconds = Math.min(layer.audio.fadeInSeconds, durationSeconds);
  const fadeOutSeconds = Math.min(
    layer.audio.fadeOutSeconds,
    Math.max(0, durationSeconds - fadeInSeconds),
  );
  const audio = { ...layer.audio, fadeInSeconds, fadeOutSeconds };

  if (layer.kind === "video") {
    return {
      ...layer,
      playbackSpeed,
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

  return { ...layer, durationSeconds, playbackSpeed, audio };
}
