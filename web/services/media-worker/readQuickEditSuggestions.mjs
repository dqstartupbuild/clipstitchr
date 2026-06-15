export function readQuickEditSuggestions(value) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const removeRanges = Array.isArray(value.removeRanges)
    ? value.removeRanges.flatMap((range) => {
        if (!range || typeof range !== "object") {
          return [];
        }

        if (
          !Number.isFinite(range.start) ||
          !Number.isFinite(range.end) ||
          range.end <= range.start
        ) {
          return [];
        }

        return [
          {
            start: range.start,
            end: range.end,
            ...(typeof range.reason === "string" && range.reason.trim()
              ? { reason: range.reason.trim() }
              : {}),
          },
        ];
      })
    : [];
  const overlayText =
    value.overlayText &&
    typeof value.overlayText === "object" &&
    typeof value.overlayText.replaceWith === "string" &&
    value.overlayText.replaceWith.trim()
      ? {
          replaceWith: value.overlayText.replaceWith.trim(),
          ...(typeof value.overlayText.reason === "string" &&
          value.overlayText.reason.trim()
            ? { reason: value.overlayText.reason.trim() }
            : {}),
        }
      : undefined;
  const crop =
    value.crop && typeof value.crop === "object" && value.crop.mode === "smart-9x16"
      ? {
          mode: "smart-9x16",
          ...(typeof value.crop.removeBlackBars === "boolean"
            ? { removeBlackBars: value.crop.removeBlackBars }
            : {}),
          ...(Number.isFinite(value.crop.positionX)
            ? { positionX: value.crop.positionX }
            : {}),
          ...(Number.isFinite(value.crop.positionY)
            ? { positionY: value.crop.positionY }
            : {}),
          ...(Number.isFinite(value.crop.scale) ? { scale: value.crop.scale } : {}),
          ...(typeof value.crop.reason === "string" && value.crop.reason.trim()
            ? { reason: value.crop.reason.trim() }
            : {}),
        }
      : undefined;
  const trimStart = Number.isFinite(value.trimStart)
    ? value.trimStart
    : undefined;
  const trimEnd =
    value.trimEnd === null
      ? null
      : Number.isFinite(value.trimEnd)
        ? value.trimEnd
        : undefined;
  const summary =
    typeof value.summary === "string" && value.summary.trim()
      ? value.summary.trim()
      : undefined;

  if (
    trimStart === undefined &&
    trimEnd === undefined &&
    removeRanges.length === 0 &&
    !overlayText &&
    !crop &&
    !summary
  ) {
    return undefined;
  }

  return {
    ...(trimStart === undefined ? {} : { trimStart }),
    ...(trimEnd === undefined ? {} : { trimEnd }),
    removeRanges,
    ...(overlayText ? { overlayText } : {}),
    ...(crop ? { crop } : {}),
    ...(summary ? { summary } : {}),
  };
}
