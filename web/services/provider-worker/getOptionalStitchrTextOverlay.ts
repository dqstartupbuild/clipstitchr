import { TEXT_OVERLAY_STYLES } from "@/lib/clipstitchr/constants/textOverlayStyles";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { TextOverlayStyleId } from "@/lib/clipstitchr/types/TextOverlayStyleId";

const textOverlayStyleIds = new Set(
  TEXT_OVERLAY_STYLES.map((style) => style.id),
);

function getFiniteNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }

  return value;
}

function getTextOverlayStyleId(value: unknown): TextOverlayStyleId {
  return typeof value === "string" &&
    textOverlayStyleIds.has(value as TextOverlayStyleId)
    ? (value as TextOverlayStyleId)
    : "hook";
}

export function getOptionalStitchrTextOverlay(
  value: unknown,
): TextOverlay | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const text = typeof source.text === "string" ? source.text.trim() : "";

  if (!text) {
    return undefined;
  }

  return {
    ...(typeof source.id === "string" ? { id: source.id } : {}),
    text,
    startTime: getFiniteNumber(source.startTime, "Template overlay start"),
    endTime: getFiniteNumber(source.endTime, "Template overlay end"),
    x: getFiniteNumber(source.x, "Template overlay x"),
    y: getFiniteNumber(source.y, "Template overlay y"),
    width: getFiniteNumber(source.width, "Template overlay width"),
    fontSize: getFiniteNumber(source.fontSize, "Template overlay font size"),
    styleId: getTextOverlayStyleId(source.styleId),
    ...(typeof source.color === "string" ? { color: source.color } : {}),
    ...(typeof source.backgroundColor === "string"
      ? { backgroundColor: source.backgroundColor }
      : {}),
    ...(typeof source.strokeColor === "string"
      ? { strokeColor: source.strokeColor }
      : {}),
  };
}
