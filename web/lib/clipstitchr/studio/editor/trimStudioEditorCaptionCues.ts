import type { StudioEditorCaptionCue } from "../../types/studioEditor/StudioEditorCaptionCue";

export function trimStudioEditorCaptionCues(
  cues: readonly StudioEditorCaptionCue[],
  sourceOffsetDeltaSeconds: number,
  durationSeconds: number,
) {
  return cues
    .filter(
      (cue) =>
        cue.endSeconds > sourceOffsetDeltaSeconds &&
        cue.startSeconds < sourceOffsetDeltaSeconds + durationSeconds,
    )
    .map((cue) => ({
      ...cue,
      startSeconds: Math.max(0, cue.startSeconds - sourceOffsetDeltaSeconds),
      endSeconds: Math.min(
        durationSeconds,
        cue.endSeconds - sourceOffsetDeltaSeconds,
      ),
    }));
}
