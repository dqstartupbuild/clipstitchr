import type { ProductEnrichment } from "@/lib/clipstitchr/types/ProductEnrichment";

function getJsonText(outputText: string) {
  const trimmedText = outputText.trim();
  const codeFenceMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);

  return codeFenceMatch?.[1]?.trim() ?? trimmedText;
}

function normalizeString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function parseProductEnrichmentOutputText(
  outputText: string,
): ProductEnrichment {
  const parsed = JSON.parse(getJsonText(outputText)) as {
    inferredPainPoints?: unknown;
    inferredProblem?: unknown;
    problemSolved?: unknown;
  };
  const inferredProblem =
    normalizeString(parsed.inferredProblem, 300) ||
    normalizeString(parsed.problemSolved, 300) ||
    undefined;
  const inferredPainPoints = Array.isArray(parsed.inferredPainPoints)
    ? parsed.inferredPainPoints
        .map((painPoint) => normalizeString(painPoint, 160))
        .filter(Boolean)
        .slice(0, 8)
    : [];

  return {
    inferredProblem,
    inferredPainPoints,
  };
}
