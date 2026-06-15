import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import { normalizeQuickEditRemoveRanges } from "@/lib/clipstitchr/utils/normalizeQuickEditRemoveRanges";

type GetQuickEditSuggestionsWithRemoveRangesOptions = {
  duration: number;
  quickEdit?: QuickEditSuggestions;
  removeRanges: QuickEditRemoveRange[];
};

export function getQuickEditSuggestionsWithRemoveRanges({
  duration,
  quickEdit,
  removeRanges,
}: GetQuickEditSuggestionsWithRemoveRangesOptions): QuickEditSuggestions | undefined {
  const nextRemoveRanges = normalizeQuickEditRemoveRanges(
    [...(quickEdit?.removeRanges ?? []), ...removeRanges],
    duration,
  );

  if (!quickEdit && !nextRemoveRanges.length) {
    return undefined;
  }

  return {
    ...(quickEdit?.trimStart === undefined
      ? {}
      : { trimStart: quickEdit.trimStart }),
    ...(quickEdit?.trimEnd === undefined ? {} : { trimEnd: quickEdit.trimEnd }),
    removeRanges: nextRemoveRanges,
    ...(quickEdit?.overlayText ? { overlayText: quickEdit.overlayText } : {}),
    ...(quickEdit?.crop ? { crop: quickEdit.crop } : {}),
    ...(quickEdit?.summary ? { summary: quickEdit.summary } : {}),
  };
}
