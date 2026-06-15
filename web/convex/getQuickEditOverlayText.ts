type QuickEditOverlayTextLike = {
  reason?: string;
  replaceWith?: string;
};

type QuickEditLike = {
  overlayText?: QuickEditOverlayTextLike;
};

type PerformanceScoreLike = {
  quickEditSuggestions?: QuickEditLike;
};

export function getQuickEditOverlayText({
  performanceScore,
  quickEdit,
}: {
  performanceScore?: PerformanceScoreLike | null;
  quickEdit?: QuickEditLike | null;
}) {
  const overlayText =
    quickEdit?.overlayText ?? performanceScore?.quickEditSuggestions?.overlayText;
  const replaceWith = overlayText?.replaceWith?.trim();
  const reason = overlayText?.reason?.trim();

  if (!replaceWith) {
    return undefined;
  }

  return {
    replaceWith,
    ...(reason ? { reason } : {}),
  };
}
