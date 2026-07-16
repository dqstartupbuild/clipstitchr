import type { Doc } from "@/convex/_generated/dataModel";
import { stripWebsiteSourcedProductDetails } from "@/lib/clipstitchr/utils/stripWebsiteSourcedProductDetails";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createProductProfileFromConvexDocument(
  product: Doc<"products">,
): ProductProfile {
  return {
    id: product.id,
    name: product.name,
    productDetails: stripWebsiteSourcedProductDetails(product.productDetails),
    audienceDetails: product.audienceDetails,
    emotionalNarrative: product.emotionalNarrative,
    websiteUrl: product.websiteUrl,
    cliprPlaceholderFillers: product.cliprPlaceholderFillers,
    eligibleCliprHookStyleKeys: product.eligibleCliprHookStyleKeys,
    eligibleCliprHookTemplateIds: product.eligibleCliprHookTemplateIds,
    hookEdgeLevel: product.hookEdgeLevel as ProductProfile["hookEdgeLevel"],
    hookGenerationGoal:
      product.hookGenerationGoal as ProductProfile["hookGenerationGoal"],
    inferredProblem: product.inferredProblem,
    inferredPainPoints: product.inferredPainPoints,
    preferredCliprHookStyleKey: product.preferredCliprHookStyleKey,
    postBridgeSocialAccountIds: product.postBridgeSocialAccountIds,
    rejectedHookExamples: product.rejectedHookExamples,
    winningHookExamples: product.winningHookExamples,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
