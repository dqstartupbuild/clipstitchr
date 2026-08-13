import { snapStudioEditorSecondsToFrame } from "@/lib/clipstitchr/studio/editor/snapStudioEditorSecondsToFrame";
import type { StudioEditorCaptionLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCaptionLayer";
import { createId } from "@/lib/clipstitchr/utils/createId";

export function addStudioEditorCaptionCue(
  layer: StudioEditorCaptionLayer,
  fps: number,
  onChange: (layer: StudioEditorCaptionLayer) => void,
) {
  const startSeconds = layer.cues.at(-1)?.endSeconds ?? 0;
  const minimum = 1 / fps;
  if (startSeconds + minimum > layer.durationSeconds + 1e-7) {
    return;
  }

  const endSeconds = snapStudioEditorSecondsToFrame(
    Math.min(layer.durationSeconds, startSeconds + 2),
    fps,
  );
  onChange({
    ...layer,
    cues: [
      ...layer.cues,
      { id: createId(), startSeconds, endSeconds, text: "Next caption" },
    ],
  });
}
