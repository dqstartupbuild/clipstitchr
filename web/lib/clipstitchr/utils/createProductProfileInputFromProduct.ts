import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export function createProductProfileInputFromProduct(
  product: ProductProfile,
): ProductProfileCreateInput {
  return {
    name: product.name,
    productDetails: product.productDetails,
    audienceDetails: product.audienceDetails,
    ...(product.emotionalNarrative
      ? { emotionalNarrative: product.emotionalNarrative }
      : {}),
    ...(product.websiteUrl ? { websiteUrl: product.websiteUrl } : {}),
    ...(product.hookEdgeLevel ? { hookEdgeLevel: product.hookEdgeLevel } : {}),
    ...(product.hookGenerationGoal
      ? { hookGenerationGoal: product.hookGenerationGoal }
      : {}),
    ...(product.inferredProblem
      ? { inferredProblem: product.inferredProblem }
      : {}),
    inferredPainPoints: product.inferredPainPoints,
    ...(product.preferredCliprHookStyleKey
      ? { preferredCliprHookStyleKey: product.preferredCliprHookStyleKey }
      : {}),
    rejectedHookExamples: product.rejectedHookExamples ?? [],
    winningHookExamples: product.winningHookExamples ?? [],
  };
}
