import type { StitchScoreReassessment } from "@/lib/clipstitchr/types/StitchScoreReassessment";

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

export function parseStitchScoreReassessment(
  value: unknown,
): StitchScoreReassessment | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const reassessment = {
    completedImprovements: parseTextList(source.completedImprovements, 5, 180),
    remainingImprovements: parseTextList(source.remainingImprovements, 5, 180),
    postingReadiness: parseText(source.postingReadiness, 240),
  };

  return reassessment.completedImprovements.length ||
    reassessment.remainingImprovements.length ||
    reassessment.postingReadiness
    ? reassessment
    : undefined;
}
