import type { Doc } from "@/convex/_generated/dataModel";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createProductProfileFromConvexDocument(
  product: Doc<"products">,
): ProductProfile {
  return {
    id: product.id,
    name: product.name,
    productDetails: product.productDetails,
    audienceDetails: product.audienceDetails,
    websiteUrl: product.websiteUrl,
    cliprPlaceholderFillers: product.cliprPlaceholderFillers,
    eligibleCliprHookStyleKeys: product.eligibleCliprHookStyleKeys,
    eligibleCliprHookTemplateIds: product.eligibleCliprHookTemplateIds,
    inferredProblem: product.inferredProblem,
    inferredPainPoints: product.inferredPainPoints,
    preferredCliprHookStyleKey: product.preferredCliprHookStyleKey,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
