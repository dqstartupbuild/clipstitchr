import { snapStudioEditorSecondsToFrame } from "@/lib/clipstitchr/studio/editor/snapStudioEditorSecondsToFrame";
import type { StudioEditorCaptionLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCaptionLayer";

export function updateStudioEditorCaptionCue(
  layer: StudioEditorCaptionLayer,
  cueId: string,
  cue: StudioEditorCaptionLayer["cues"][number],
  fps: number,
  onChange: (layer: StudioEditorCaptionLayer) => void,
) {
  const index = layer.cues.findIndex((candidate) => candidate.id === cueId);
  const previousEnd = index > 0 ? layer.cues[index - 1].endSeconds : 0;
  const nextStart =
    index < layer.cues.length - 1
      ? layer.cues[index + 1].startSeconds
      : layer.durationSeconds;
  const minimum = 1 / fps;
  const startSeconds = Math.max(
    previousEnd,
    snapStudioEditorSecondsToFrame(cue.startSeconds, fps),
  );
  const endSeconds = Math.min(
    nextStart,
    Math.max(
      startSeconds + minimum,
      snapStudioEditorSecondsToFrame(cue.endSeconds, fps),
    ),
  );
  onChange({
    ...layer,
    cues: layer.cues.map((candidate) =>
      candidate.id === cueId ? { ...cue, startSeconds, endSeconds } : candidate,
    ),
  });
}
