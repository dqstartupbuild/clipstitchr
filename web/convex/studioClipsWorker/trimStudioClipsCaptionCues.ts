import type { StudioClipsCaptionCue } from "../../lib/clipstitchr/types/studioClips/StudioClipsCaptionCue";

export function trimStudioClipsCaptionCues(
  cues: StudioClipsCaptionCue[],
  startSeconds: number,
  endSeconds: number,
) {
  return cues.flatMap((cue) => {
    if (cue.endSeconds <= startSeconds || cue.startSeconds >= endSeconds) return [];
    const start = Math.max(0, cue.startSeconds - startSeconds);
    const end = Math.min(
      endSeconds - startSeconds,
      cue.endSeconds - startSeconds,
    );
    return end > start
      ? [{ endSeconds: end, startSeconds: start, text: cue.text }]
      : [];
  });
}
