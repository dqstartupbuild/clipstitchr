import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function getProductSwiprContext(product: ProductProfile) {
  return [
    product.name,
    product.productDetails,
    product.audienceDetails ? `Audience: ${product.audienceDetails}` : "",
    product.inferredProblem
      ? `Problem solved: ${product.inferredProblem}`
      : "",
    product.inferredPainPoints.length
      ? `Audience pain points: ${product.inferredPainPoints.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
