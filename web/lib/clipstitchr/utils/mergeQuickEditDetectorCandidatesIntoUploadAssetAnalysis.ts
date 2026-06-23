import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import type { UploadAssetAnalysis } from "@/lib/clipstitchr/types/UploadAssetAnalysis";
import { mergeQuickEditDetectorCandidatesIntoSuggestions } from "@/lib/clipstitchr/utils/mergeQuickEditDetectorCandidatesIntoSuggestions";

export function mergeQuickEditDetectorCandidatesIntoUploadAssetAnalysis({
  analysis,
  detectorCandidates,
}: {
  analysis: UploadAssetAnalysis;
  detectorCandidates: QuickEditCandidate[];
}): UploadAssetAnalysis {
  if (!analysis.performanceScore || !detectorCandidates.length) {
    return analysis;
  }

  return {
    ...analysis,
    performanceScore: {
      ...analysis.performanceScore,
      quickEditSuggestions: mergeQuickEditDetectorCandidatesIntoSuggestions({
        detectorCandidates,
        suggestions: analysis.performanceScore.quickEditSuggestions,
      }),
    },
  };
}
