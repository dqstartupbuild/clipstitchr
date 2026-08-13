import type { StudioStitchWordTiming } from "../../types/studioStitch/StudioStitchWordTiming";
import { normalizeStudioStitchText } from "./normalizeStudioStitchText";

export function normalizeStudioStitchWordTimings(
  timings: readonly StudioStitchWordTiming[],
  rawDurationSeconds: number,
): StudioStitchWordTiming[] {
  if (!Array.isArray(timings) || timings.length === 0 || timings.length > 1_000) {
    throw new Error("Voice word timings must contain 1 through 1,000 words.");
  }
  let previousEndSeconds = 0;
  return timings.map((timing, index) => {
    const word = normalizeStudioStitchText(
      timing.word,
      `Voice word ${index + 1}`,
      100,
    );
    if (
      !Number.isFinite(timing.startSeconds) ||
      !Number.isFinite(timing.endSeconds) ||
      timing.startSeconds < previousEndSeconds - 1e-6 ||
      timing.endSeconds <= timing.startSeconds ||
      timing.endSeconds > rawDurationSeconds + 1e-6
    ) {
      throw new Error("Voice word timings must be ordered inside raw audio.");
    }
    previousEndSeconds = timing.endSeconds;
    return {
      word,
      startSeconds: timing.startSeconds,
      endSeconds: timing.endSeconds,
    };
  });
}
