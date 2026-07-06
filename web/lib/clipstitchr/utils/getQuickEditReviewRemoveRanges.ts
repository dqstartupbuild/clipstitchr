import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";

export function getQuickEditReviewRemoveRanges(
  quickEdit?: QuickEditSuggestions | null,
): QuickEditRemoveRange[] {
  if (!quickEdit) {
    return [];
  }

  if (quickEdit.removeRanges.length) {
    return quickEdit.removeRanges;
  }

  return (quickEdit.candidates ?? [])
    .filter(
      (candidate) =>
        Number.isFinite(candidate.start) &&
        Number.isFinite(candidate.end) &&
        candidate.end > candidate.start,
    )
    .slice(0, 8)
    .map((candidate) => ({
      start: candidate.start,
      end: candidate.end,
      ...(candidate.reason ? { reason: candidate.reason } : {}),
    }));
}
