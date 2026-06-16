import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";

export function getQuickEditSuggestionsWithCrop(
  quickEdit: QuickEditSuggestions | undefined,
  crop: QuickEditCrop | null,
): QuickEditSuggestions | undefined {
  if (crop) {
    return {
      ...quickEdit,
      crop,
      removeRanges: quickEdit?.removeRanges ?? [],
    };
  }

  if (
    !quickEdit ||
    (!quickEdit.removeRanges.length &&
      !quickEdit.overlayText &&
      !quickEdit.summary &&
      quickEdit.trimStart === undefined &&
      quickEdit.trimEnd === undefined)
  ) {
    return undefined;
  }

  const { crop: _crop, ...rest } = quickEdit;

  void _crop;

  return rest;
}
