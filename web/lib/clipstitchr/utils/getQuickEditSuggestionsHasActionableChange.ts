import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";

export function getQuickEditSuggestionsHasActionableChange(
  quickEdit?: QuickEditSuggestions | null,
) {
  return Boolean(
    quickEdit &&
      (quickEdit.trimStart !== undefined ||
        quickEdit.trimEnd !== undefined ||
        quickEdit.removeRanges.length ||
        quickEdit.overlayText ||
        quickEdit.crop),
  );
}
