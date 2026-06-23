import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";
import type { QuickEditOverlayText } from "@/lib/clipstitchr/types/QuickEditOverlayText";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import { parseQuickEditCandidates } from "@/lib/clipstitchr/utils/parseQuickEditCandidates";

function parseTime(value: unknown) {
  if (value === null) {
    return null;
  }

  const time = Number(value);

  return Number.isFinite(time) && time >= 0 ? time : undefined;
}

function parseText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseRemoveRange(value: unknown): QuickEditRemoveRange | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const start = parseTime(source.start);
  const end = parseTime(source.end);

  if (start === null || start === undefined || end === null || end === undefined) {
    return null;
  }

  if (end <= start) {
    return null;
  }

  const reason = parseText(source.reason, 180);

  return {
    start,
    end,
    ...(reason ? { reason } : {}),
  };
}

function parseRemoveRanges(value: unknown) {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const range = parseRemoveRange(item);

        return range ? [range] : [];
      }).slice(0, 8)
    : [];
}

function parseOverlayText(value: unknown): QuickEditOverlayText | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const replaceWith = parseText(source.replaceWith, 180);
  const reason = parseText(source.reason, 180);

  if (!replaceWith) {
    return undefined;
  }

  return {
    replaceWith,
    ...(reason ? { reason } : {}),
  };
}

function parseNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function parseCrop(value: unknown): QuickEditCrop | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const mode = source.mode === "smart-9x16" ? "smart-9x16" : undefined;

  if (!mode) {
    return undefined;
  }

  const reason = parseText(source.reason, 220);
  const positionX = parseNumber(source.positionX);
  const positionY = parseNumber(source.positionY);
  const scale = parseNumber(source.scale);

  return {
    mode,
    ...(typeof source.removeBlackBars === "boolean"
      ? { removeBlackBars: source.removeBlackBars }
      : {}),
    ...(positionX === undefined ? {} : { positionX }),
    ...(positionY === undefined ? {} : { positionY }),
    ...(scale === undefined ? {} : { scale }),
    ...(reason ? { reason } : {}),
  };
}

function getHasQuickEditChange(suggestions: QuickEditSuggestions) {
  return Boolean(
    suggestions.trimStart !== undefined ||
      suggestions.trimEnd !== undefined ||
      (suggestions.candidates?.length ?? 0) ||
      suggestions.removeRanges.length ||
      suggestions.overlayText ||
      suggestions.crop,
  );
}

export function parseQuickEditSuggestions(
  value: unknown,
): QuickEditSuggestions | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const trimStart = parseTime(source.trimStart);
  const trimEnd = parseTime(source.trimEnd);
  const overlayText = parseOverlayText(source.overlayText);
  const crop = parseCrop(source.crop);
  const candidates = parseQuickEditCandidates(
    source.candidates ?? source.candidateRanges,
  );
  const summary = parseText(source.summary, 260);
  const suggestions: QuickEditSuggestions = {
    ...(trimStart === undefined || trimStart === null ? {} : { trimStart }),
    ...(trimEnd === undefined ? {} : { trimEnd }),
    ...(candidates.length ? { candidates } : {}),
    removeRanges: parseRemoveRanges(source.removeRanges),
    ...(overlayText ? { overlayText } : {}),
    ...(crop ? { crop } : {}),
    ...(summary ? { summary } : {}),
  };

  return getHasQuickEditChange(suggestions) ? suggestions : undefined;
}
