import type { ProductEnrichment } from "@/lib/clipstitchr/types/ProductEnrichment";
import { cliprHookStyles } from "@/lib/clipstitchr/resources/clipr/cliprHookStyles";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import { sanitizeGeneratedLongFormText } from "@/lib/clipstitchr/utils/sanitizeGeneratedLongFormText";

function getJsonText(outputText: string) {
  const trimmedText = outputText.trim();
  const codeFenceMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (codeFenceMatch?.[1]) {
    return codeFenceMatch[1].trim();
  }

  return trimmedText.match(/\{[\s\S]*\}/)?.[0] ?? trimmedText;
}

function normalizeString(value: unknown, maxLength: number) {
  return sanitizeGeneratedLongFormText({
    fallback: "",
    maxLength,
    text: typeof value === "string" ? value : "",
  });
}

function normalizeStringArray(
  value: unknown,
  allowedValues: Set<string> | null,
  limit: number,
  maxLength: number,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((entry) => normalizeString(entry, maxLength))
        .filter((entry) => entry && (!allowedValues || allowedValues.has(entry))),
    ),
  ).slice(0, limit);
}

function normalizePlaceholderFillers(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const allowedKeys = new Set(
    cliprHookTemplates.flatMap((template) => template.requiredVariables),
  );

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, entries]) => [
        normalizeString(key, 40),
        normalizeStringArray(entries, null, 16, 120),
      ] as const)
      .filter(([key, entries]) => key && allowedKeys.has(key) && entries.length),
  );
}

function getEmptyProductEnrichment(): ProductEnrichment {
  return {
    audienceDetails: undefined,
    cliprPlaceholderFillers: {},
    eligibleCliprHookStyleKeys: [],
    eligibleCliprHookTemplateIds: [],
    emotionalNarrative: undefined,
    inferredProblem: undefined,
    inferredPainPoints: [],
    productDetails: undefined,
  };
}

export function parseProductEnrichmentOutputText(
  outputText: string,
): ProductEnrichment {
  let parsed: {
    cliprPlaceholderFillers?: unknown;
    audienceDetails?: unknown;
    eligibleCliprHookStyleKeys?: unknown;
    eligibleCliprHookTemplateIds?: unknown;
    emotionalNarrative?: unknown;
    inferredPainPoints?: unknown;
    inferredProblem?: unknown;
    productDetails?: unknown;
    problemSolved?: unknown;
  };

  try {
    parsed = JSON.parse(getJsonText(outputText)) as typeof parsed;
  } catch {
    return getEmptyProductEnrichment();
  }

  const styleKeys = new Set(cliprHookStyles.map((style) => style.styleKey));
  const templateIds = new Set(
    cliprHookTemplates.map((template) => template.id),
  );
  const inferredProblem =
    normalizeString(parsed.inferredProblem, 300) ||
    normalizeString(parsed.problemSolved, 300) ||
    undefined;
  const inferredPainPoints = normalizeStringArray(
    parsed.inferredPainPoints,
    null,
    10,
    160,
  );

  return {
    audienceDetails: normalizeString(parsed.audienceDetails, 2000) || undefined,
    cliprPlaceholderFillers: normalizePlaceholderFillers(
      parsed.cliprPlaceholderFillers,
    ),
    eligibleCliprHookStyleKeys: normalizeStringArray(
      parsed.eligibleCliprHookStyleKeys,
      styleKeys,
      styleKeys.size,
      80,
    ),
    eligibleCliprHookTemplateIds: normalizeStringArray(
      parsed.eligibleCliprHookTemplateIds,
      templateIds,
      templateIds.size,
      80,
    ),
    emotionalNarrative:
      normalizeString(parsed.emotionalNarrative, 1500) || undefined,
    inferredProblem,
    inferredPainPoints,
    productDetails: normalizeString(parsed.productDetails, 2000) || undefined,
  };
}
