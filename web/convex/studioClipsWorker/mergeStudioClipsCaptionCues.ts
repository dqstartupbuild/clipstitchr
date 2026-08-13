import type { StudioClipsCaptionCue } from "../../lib/clipstitchr/types/studioClips/StudioClipsCaptionCue";
import type { StudioClipsImmutableSourceOutput } from "../../lib/clipstitchr/types/studioClips/StudioClipsImmutableSourceOutput";

export function mergeStudioClipsCaptionCues(
  sources: StudioClipsImmutableSourceOutput[],
): StudioClipsCaptionCue[] {
  let offset = 0;
  const merged: StudioClipsCaptionCue[] = [];
  for (const source of sources) {
    for (const cue of source.captionCues ?? []) {
      merged.push({
        endSeconds: cue.endSeconds + offset,
        startSeconds: cue.startSeconds + offset,
        text: cue.text,
      });
    }
    offset += source.durationSeconds;
  }
  return merged;
}
