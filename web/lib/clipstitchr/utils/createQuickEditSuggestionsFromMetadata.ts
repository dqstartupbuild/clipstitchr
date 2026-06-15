import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";

export function createQuickEditSuggestionsFromMetadata(
  quickEdit?: QuickEditSuggestions | null,
): QuickEditSuggestions | undefined {
  if (!quickEdit) {
    return undefined;
  }

  return {
    ...(quickEdit.trimStart === undefined
      ? {}
      : { trimStart: quickEdit.trimStart }),
    ...(quickEdit.trimEnd === undefined
      ? {}
      : { trimEnd: quickEdit.trimEnd }),
    removeRanges: quickEdit.removeRanges,
    ...(quickEdit.overlayText ? { overlayText: quickEdit.overlayText } : {}),
    ...(quickEdit.crop ? { crop: quickEdit.crop } : {}),
    ...(quickEdit.summary ? { summary: quickEdit.summary } : {}),
  };
}
