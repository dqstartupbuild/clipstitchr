type QuickEditSuggestionsLike = {
  crop?: unknown;
  overlayText?: unknown;
  removeRanges?: unknown[];
  summary?: string;
  trimEnd?: number | null;
  trimStart?: number;
};

export function createQuickEditSuggestionsFromMetadata(
  quickEdit?: QuickEditSuggestionsLike | null,
) {
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
    removeRanges: quickEdit.removeRanges ?? [],
    ...(quickEdit.overlayText ? { overlayText: quickEdit.overlayText } : {}),
    ...(quickEdit.crop ? { crop: quickEdit.crop } : {}),
    ...(quickEdit.summary ? { summary: quickEdit.summary } : {}),
  };
}
