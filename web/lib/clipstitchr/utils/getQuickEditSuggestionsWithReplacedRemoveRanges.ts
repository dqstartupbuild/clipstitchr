import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import { normalizeQuickEditRemoveRanges } from "@/lib/clipstitchr/utils/normalizeQuickEditRemoveRanges";

type GetQuickEditSuggestionsWithReplacedRemoveRangesOptions = {
  duration: number;
  quickEdit?: QuickEditSuggestions;
  removeRanges: QuickEditRemoveRange[];
};

export function getQuickEditSuggestionsWithReplacedRemoveRanges({
  duration,
  quickEdit,
  removeRanges,
}: GetQuickEditSuggestionsWithReplacedRemoveRangesOptions):
  | QuickEditSuggestions
  | undefined {
  const nextRemoveRanges = normalizeQuickEditRemoveRanges(removeRanges, duration);

  if (nextRemoveRanges.length) {
    return {
      ...quickEdit,
      removeRanges: nextRemoveRanges,
    };
  }

  if (
    !quickEdit ||
    (!quickEdit.crop &&
      !quickEdit.overlayText &&
      !quickEdit.summary &&
      quickEdit.trimStart === undefined &&
      quickEdit.trimEnd === undefined)
  ) {
    return undefined;
  }

  return {
    ...quickEdit,
    removeRanges: [],
  };
}
