import type { StudioStitchWordTiming } from "../../types/studioStitch/StudioStitchWordTiming";
import { roundStudioStitchTiming } from "./roundStudioStitchTiming";

export function fitStudioStitchWordTimings(
  timings: readonly StudioStitchWordTiming[],
  tempoFactor: number,
): StudioStitchWordTiming[] {
  if (!Number.isFinite(tempoFactor) || tempoFactor <= 0) {
    throw new Error("Voice tempo factor must be a positive finite number.");
  }
  return timings.map((timing) => ({
    word: timing.word,
    startSeconds: roundStudioStitchTiming(timing.startSeconds / tempoFactor),
    endSeconds: roundStudioStitchTiming(timing.endSeconds / tempoFactor),
  }));
}
