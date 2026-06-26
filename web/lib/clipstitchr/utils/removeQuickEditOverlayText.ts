import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";

export function removeQuickEditOverlayText(
  quickEdit?: QuickEditSuggestions,
): QuickEditSuggestions | undefined {
  if (!quickEdit?.overlayText) {
    return quickEdit;
  }

  const quickEditWithoutOverlayText: QuickEditSuggestions = {
    ...(quickEdit.trimStart === undefined
      ? {}
      : { trimStart: quickEdit.trimStart }),
    ...(quickEdit.trimEnd === undefined ? {} : { trimEnd: quickEdit.trimEnd }),
    ...(quickEdit.candidates?.length
      ? { candidates: quickEdit.candidates }
      : {}),
    removeRanges: quickEdit.removeRanges,
    ...(quickEdit.crop ? { crop: quickEdit.crop } : {}),
    ...(quickEdit.summary ? { summary: quickEdit.summary } : {}),
  };

  return quickEditWithoutOverlayText.trimStart !== undefined ||
    quickEditWithoutOverlayText.trimEnd !== undefined ||
    (quickEditWithoutOverlayText.candidates?.length ?? 0) > 0 ||
    quickEditWithoutOverlayText.removeRanges.length > 0 ||
    quickEditWithoutOverlayText.crop
    ? quickEditWithoutOverlayText
    : undefined;
}
