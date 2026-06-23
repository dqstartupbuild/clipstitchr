type QuickEditRemoveRangeLike = {
  end: number;
  reason?: string;
  start: number;
};

type QuickEditLike = {
  crop?: {
    mode: "smart-9x16";
    positionX?: number;
    positionY?: number;
    reason?: string;
    removeBlackBars?: boolean;
    scale?: number;
  };
  overlayText?: {
    reason?: string;
    replaceWith: string;
  };
  removeRanges: QuickEditRemoveRangeLike[];
  summary?: string;
  trimEnd?: number | null;
  trimStart?: number;
};

export function getQuickEditWithRemoveRanges<
  QuickEdit extends QuickEditLike | undefined,
>(quickEdit: QuickEdit, removeRanges: QuickEditRemoveRangeLike[]) {
  if (removeRanges.length) {
    return {
      ...quickEdit,
      removeRanges,
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
