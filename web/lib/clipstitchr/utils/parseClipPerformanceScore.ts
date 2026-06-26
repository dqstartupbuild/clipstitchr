import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";
import { parseQuickEditSuggestions } from "@/lib/clipstitchr/utils/parseQuickEditSuggestions";
import { removeQuickEditOverlayText } from "@/lib/clipstitchr/utils/removeQuickEditOverlayText";

function parseScore(value: unknown) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return undefined;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function parseText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseTextList(value: unknown, maxItems: number, maxLength: number) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, maxLength))
        .filter(Boolean)
        .slice(0, maxItems)
    : [];
}

export function parseClipPerformanceScore(
  value: unknown,
): ClipPerformanceScore | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const overall = parseScore(source.overall);

  if (overall === undefined) {
    return undefined;
  }

  const hook = parseScore(source.hook);
  const cameraPresence = parseScore(source.cameraPresence);
  const pacing = parseScore(source.pacing);
  const clarity = parseScore(source.clarity);
  const platformFit = parseScore(source.platformFit);
  const stitchFit = parseScore(source.stitchFit);
  const quickEditSuggestions = removeQuickEditOverlayText(
    parseQuickEditSuggestions(source.quickEditSuggestions),
  );

  return {
    overall,
    ...(hook === undefined ? {} : { hook }),
    ...(cameraPresence === undefined ? {} : { cameraPresence }),
    ...(pacing === undefined ? {} : { pacing }),
    ...(clarity === undefined ? {} : { clarity }),
    ...(platformFit === undefined ? {} : { platformFit }),
    ...(stitchFit === undefined ? {} : { stitchFit }),
    summary: parseText(source.summary, 220),
    bestUse: parseText(source.bestUse, 180),
    strengths: parseTextList(source.strengths, 3, 120),
    fixes: parseTextList(source.fixes, 3, 140),
    ...(quickEditSuggestions ? { quickEditSuggestions } : {}),
  };
}
