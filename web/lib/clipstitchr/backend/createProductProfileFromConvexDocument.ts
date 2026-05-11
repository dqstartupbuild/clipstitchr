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
    inferredProblem: product.inferredProblem,
    inferredPainPoints: product.inferredPainPoints,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
