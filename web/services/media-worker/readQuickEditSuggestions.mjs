export function readQuickEditSuggestions(value) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidateSignalValues = new Set([
    "black-frame",
    "loading-spinner",
    "loading-text",
    "long-pause",
    "low-motion",
    "no-words",
    "repeated-frame",
    "scene-change",
    "silence",
    "static-frame",
  ]);
  const candidates = Array.isArray(value.candidates)
    ? value.candidates.flatMap((candidate) => {
        if (!candidate || typeof candidate !== "object") {
          return [];
        }

        const signals = Array.isArray(candidate.signals)
          ? Array.from(
              new Set(
                candidate.signals.filter(
                  (signal) =>
                    typeof signal === "string" &&
                    candidateSignalValues.has(signal),
                ),
              ),
            ).slice(0, 6)
          : [];

        if (
          !Number.isFinite(candidate.start) ||
          !Number.isFinite(candidate.end) ||
          !Number.isFinite(candidate.confidence) ||
          candidate.end <= candidate.start ||
          !signals.length
        ) {
          return [];
        }

        return [
          {
            start: candidate.start,
            end: candidate.end,
            confidence: Math.max(0, Math.min(1, candidate.confidence)),
            signals,
            ...(typeof candidate.reason === "string" && candidate.reason.trim()
              ? { reason: candidate.reason.trim() }
              : {}),
            ...(typeof candidate.stats === "string" && candidate.stats.trim()
              ? { stats: candidate.stats.trim() }
              : {}),
          },
        ];
      })
    : [];
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
    candidates.length === 0 &&
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
    ...(candidates.length ? { candidates: candidates.slice(0, 10) } : {}),
    removeRanges,
    ...(overlayText ? { overlayText } : {}),
    ...(crop ? { crop } : {}),
    ...(summary ? { summary } : {}),
  };
}
