import type { StudioEditorCaptionCue } from "../../types/studioEditor/StudioEditorCaptionCue";

export function splitStudioEditorCaptionCues(
  cues: readonly StudioEditorCaptionCue[],
  leftDurationSeconds: number,
  rightDurationSeconds: number,
) {
  return {
    left: cues
      .filter((cue) => cue.startSeconds < leftDurationSeconds)
      .map((cue) => ({
        ...cue,
        endSeconds: Math.min(cue.endSeconds, leftDurationSeconds),
      })),
    right: cues
      .filter((cue) => cue.endSeconds > leftDurationSeconds)
      .map((cue) => ({
        ...cue,
        startSeconds: Math.max(0, cue.startSeconds - leftDurationSeconds),
        endSeconds: Math.min(
          rightDurationSeconds,
          cue.endSeconds - leftDurationSeconds,
        ),
      })),
  };
}
