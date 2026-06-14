import type { StitchScore } from "@/lib/clipstitchr/types/StitchScore";

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

function parseJsonObject(value: string) {
  const jsonText = value.match(/\{[\s\S]*\}/)?.[0] ?? "";

  if (!jsonText) {
    return undefined;
  }

  try {
    return JSON.parse(jsonText) as unknown;
  } catch {
    return undefined;
  }
}

export function parseStitchScore(value: unknown): StitchScore | undefined {
  const parsedValue = typeof value === "string" ? parseJsonObject(value) : value;

  if (!parsedValue || typeof parsedValue !== "object") {
    return undefined;
  }

  const wrapper = parsedValue as Record<string, unknown>;
  const source =
    wrapper.stitchScore &&
    typeof wrapper.stitchScore === "object" &&
    !Array.isArray(wrapper.stitchScore)
      ? (wrapper.stitchScore as Record<string, unknown>)
      : wrapper;
  const overallRetentionEstimate =
    parseScore(source.overallRetentionEstimate) ??
    parseScore(source.retentionEstimate) ??
    parseScore(source.overall);

  if (overallRetentionEstimate === undefined) {
    return undefined;
  }

  const hookToDemoFlow =
    parseScore(source.hookToDemoFlow) ?? overallRetentionEstimate;

  return {
    overallRetentionEstimate,
    hookToDemoFlow,
    summary: parseText(source.summary, 240),
    dropOffRiskPoints: parseTextList(source.dropOffRiskPoints, 4, 180),
    suggestedTrims: parseTextList(source.suggestedTrims, 4, 180),
    suggestedOverlayText: parseTextList(source.suggestedOverlayText, 3, 120),
    suggestedOpeningLine: parseText(source.suggestedOpeningLine, 140),
  };
}
