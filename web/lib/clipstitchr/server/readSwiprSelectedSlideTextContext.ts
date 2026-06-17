import type { SwiprSelectedSlideTextContext } from "@/lib/clipstitchr/types/SwiprSelectedSlideTextContext";

const MAX_CONTEXT_TEXT_LENGTH = 240;

function getContextText(value: unknown) {
  return typeof value === "string"
    ? value.trim().slice(0, MAX_CONTEXT_TEXT_LENGTH)
    : undefined;
}

function getContextNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.round(value))
    : 1;
}

export function readSwiprSelectedSlideTextContext(
  value: unknown,
): SwiprSelectedSlideTextContext | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const context = value as Record<string, unknown>;

  return {
    currentSlideText: getContextText(context.currentSlideText),
    nextSlideText: getContextText(context.nextSlideText),
    previousSlideText: getContextText(context.previousSlideText),
    slideNumber: getContextNumber(context.slideNumber),
    totalSlides: getContextNumber(context.totalSlides),
  };
}
