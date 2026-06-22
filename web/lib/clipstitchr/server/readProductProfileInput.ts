import { cliprHookStyleOptions } from "@/lib/clipstitchr/resources/clipr/cliprHookStyleOptions";
import { readHookEdgeLevel } from "@/lib/clipstitchr/server/readHookEdgeLevel";
import { readHookGenerationGoal } from "@/lib/clipstitchr/server/readHookGenerationGoal";
import { readProductHookExamples } from "@/lib/clipstitchr/server/readProductHookExamples";
import { normalizeProductWebsiteUrl } from "@/lib/clipstitchr/server/normalizeProductWebsiteUrl";
import { readInferredProductPainPoints } from "@/lib/clipstitchr/server/readInferredProductPainPoints";
import { stripWebsiteSourcedProductDetails } from "@/lib/clipstitchr/utils/stripWebsiteSourcedProductDetails";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

const cliprHookStyleKeys = new Set<string>(
  cliprHookStyleOptions.map((option) => option.value),
);

function normalizeProductDetails(value: unknown) {
  return typeof value === "string"
    ? stripWebsiteSourcedProductDetails(value)
    : "";
}

function readPreferredCliprHookStyleKey(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const styleKey = value.trim();

  return cliprHookStyleKeys.has(styleKey) ? styleKey : undefined;
}

export function readProductProfileInput(
  body: unknown,
): ProductProfileCreateInput {
  const source =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const preferredCliprHookStyleKey = readPreferredCliprHookStyleKey(
    source.preferredCliprHookStyleKey,
  );
  const hookEdgeLevel = readHookEdgeLevel(source.hookEdgeLevel);
  const hookGenerationGoal = readHookGenerationGoal(source.hookGenerationGoal);
  const rejectedHookExamples = readProductHookExamples(
    source.rejectedHookExamples,
  );
  const winningHookExamples = readProductHookExamples(source.winningHookExamples);
  const websiteUrl = normalizeProductWebsiteUrl(source.websiteUrl);
  const hasInferredProblem = Object.prototype.hasOwnProperty.call(
    source,
    "inferredProblem",
  );
  const inferredProblem =
    typeof source.inferredProblem === "string"
      ? source.inferredProblem.trim()
      : "";
  const inferredPainPoints = readInferredProductPainPoints(
    source.inferredPainPoints,
  );
  const emotionalNarrative =
    typeof source.emotionalNarrative === "string"
      ? source.emotionalNarrative.trim()
      : "";
  const input = {
    name: typeof source.name === "string" ? source.name.trim() : "",
    productDetails: normalizeProductDetails(source.productDetails),
    audienceDetails:
      typeof source.audienceDetails === "string"
        ? source.audienceDetails.trim()
        : "",
    ...(emotionalNarrative ? { emotionalNarrative } : {}),
    ...(websiteUrl ? { websiteUrl } : {}),
    ...(hasInferredProblem ? { inferredProblem } : {}),
    ...(inferredPainPoints ? { inferredPainPoints } : {}),
    ...(preferredCliprHookStyleKey ? { preferredCliprHookStyleKey } : {}),
    ...(rejectedHookExamples.length ? { rejectedHookExamples } : {}),
    ...(winningHookExamples.length ? { winningHookExamples } : {}),
    ...(hookGenerationGoal ? { hookGenerationGoal } : {}),
    ...(hookEdgeLevel ? { hookEdgeLevel } : {}),
  };

  if (!input.name) {
    throw new Error("Product name is required.");
  }

  return input;
}
