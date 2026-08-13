import type { StudioStitchWordTiming } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchWordTiming";

export function flushElevenLabsWordTiming(
  timings: StudioStitchWordTiming[],
  state: { endSeconds: number; startSeconds: number; word: string },
) {
  if (!state.word) return;
  timings.push({
    word: state.word,
    startSeconds: state.startSeconds,
    endSeconds: state.endSeconds,
  });
  state.word = "";
}
