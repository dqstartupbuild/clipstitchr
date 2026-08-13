import type { StudioStitchCaptionTimingContract } from "../../types/studioStitch/StudioStitchCaptionTimingContract";

export function createStudioStitchCaptionTimingContract(
  durationSeconds: number,
): StudioStitchCaptionTimingContract {
  return {
    providerOutput: "wordTimings",
    sourceTimebase: "secondsFromVoiceStart",
    fitRule: "divideByTempoFactor",
    phraseMaximumWords: 3,
    phraseMaximumDurationSeconds: 1.1,
    breakOnPunctuation: true,
    cueEndPaddingSeconds: 0.05,
    captionCutoffSeconds: durationSeconds - 4,
  };
}
