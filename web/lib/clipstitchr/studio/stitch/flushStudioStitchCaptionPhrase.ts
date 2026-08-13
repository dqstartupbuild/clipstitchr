import type { StudioStitchWordTiming } from "../../types/studioStitch/StudioStitchWordTiming";

export function flushStudioStitchCaptionPhrase(
  phrases: StudioStitchWordTiming[][],
  phrase: StudioStitchWordTiming[],
): void {
  if (phrase.length > 0) {
    phrases.push(phrase);
  }
}
