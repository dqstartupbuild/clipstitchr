import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import type { StitchScore } from "@/lib/clipstitchr/types/StitchScore";
import { mergeQuickEditDetectorCandidatesIntoSuggestions } from "@/lib/clipstitchr/utils/mergeQuickEditDetectorCandidatesIntoSuggestions";

export function mergeQuickEditDetectorCandidatesIntoStitchScore({
  detectorCandidates,
  stitchScore,
}: {
  detectorCandidates: QuickEditCandidate[];
  stitchScore: StitchScore;
}): StitchScore {
  if (!detectorCandidates.length) {
    return stitchScore;
  }

  return {
    ...stitchScore,
    quickEditSuggestions: mergeQuickEditDetectorCandidatesIntoSuggestions({
      detectorCandidates,
      suggestions: stitchScore.quickEditSuggestions,
    }),
  };
}
