type QuickEditOverlayTextLike = {
  reason?: string;
  replaceWith?: string;
};

type QuickEditLike = {
  overlayText?: QuickEditOverlayTextLike;
};

export function getQuickEditOverlayText({
  quickEdit,
}: {
  quickEdit?: QuickEditLike | null;
}) {
  const overlayText = quickEdit?.overlayText;
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
