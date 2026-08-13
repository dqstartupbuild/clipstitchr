import type { StudioStitchTextOverlayPlan } from "../../types/studioStitch/StudioStitchTextOverlayPlan";
import type { StudioStitchWordTiming } from "../../types/studioStitch/StudioStitchWordTiming";
import { createStudioStitchTextStyle } from "./createStudioStitchTextStyle";
import { flushStudioStitchCaptionPhrase } from "./flushStudioStitchCaptionPhrase";
import { normalizeStudioStitchComparableWord } from "./normalizeStudioStitchComparableWord";

type StudioStitchCaptionOverlayInput = {
  readonly wordTimings: readonly StudioStitchWordTiming[];
  readonly emphasisWords: readonly string[];
  readonly captionCutoffSeconds: number;
  readonly groundingClaimIds: readonly string[];
};

export function createStudioStitchCaptionOverlays(
  input: StudioStitchCaptionOverlayInput,
): StudioStitchTextOverlayPlan[] {
  const emphasisWords = new Set(
    input.emphasisWords
      .map(normalizeStudioStitchComparableWord)
      .filter((word) => word.length > 0),
  );
  const eligibleTimings = input.wordTimings.filter(
    (timing) => timing.startSeconds < input.captionCutoffSeconds,
  );
  const phrases: StudioStitchWordTiming[][] = [];
  let phrase: StudioStitchWordTiming[] = [];
  for (const timing of eligibleTimings) {
    const candidateDuration =
      phrase.length === 0
        ? timing.endSeconds - timing.startSeconds
        : timing.endSeconds - phrase[0].startSeconds;
    if (phrase.length >= 3 || (phrase.length > 0 && candidateDuration > 1.1)) {
      flushStudioStitchCaptionPhrase(phrases, phrase);
      phrase = [];
    }
    phrase.push(timing);
    if (/[.!?,;:]$/.test(timing.word)) {
      flushStudioStitchCaptionPhrase(phrases, phrase);
      phrase = [];
    }
  }
  flushStudioStitchCaptionPhrase(phrases, phrase);
  return phrases.flatMap((words, index) => {
    const text = words.map((word) => word.word).join(" ");
    const startSeconds = words[0].startSeconds;
    const endSeconds = Math.min(
      input.captionCutoffSeconds,
      words[words.length - 1].endSeconds + 0.05,
    );
    if (endSeconds <= startSeconds) {
      return [];
    }
    const emphasis = words.some((word) =>
      emphasisWords.has(normalizeStudioStitchComparableWord(word.word)),
    );
    return [
      {
        id: `overlay_caption_${String(index + 1).padStart(3, "0")}`,
        role: "caption" as const,
        text,
        startSeconds,
        endSeconds: Number(endSeconds.toFixed(6)),
        centerXPixels: 540,
        centerYPixels: 1152,
        style: createStudioStitchTextStyle("caption", text, emphasis),
        emphasis,
        groundingClaimIds: [...input.groundingClaimIds],
      },
    ];
  });
}
