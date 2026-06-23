import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import { getQuickEditCandidateMergeKey } from "@/lib/clipstitchr/utils/getQuickEditCandidateMergeKey";

export function mergeQuickEditDetectorCandidatesIntoSuggestions({
  detectorCandidates,
  suggestions,
}: {
  detectorCandidates: QuickEditCandidate[];
  suggestions?: QuickEditSuggestions;
}): QuickEditSuggestions | undefined {
  if (!detectorCandidates.length) {
    return suggestions;
  }

  const existingCandidates = suggestions?.candidates ?? [];
  const seen = new Set(existingCandidates.map(getQuickEditCandidateMergeKey));
  const nextCandidates = [
    ...existingCandidates,
    ...detectorCandidates.filter((candidate) => {
      const key = getQuickEditCandidateMergeKey(candidate);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    }),
  ].slice(0, 10);

  return {
    ...suggestions,
    candidates: nextCandidates,
    removeRanges: suggestions?.removeRanges ?? [],
  };
}
