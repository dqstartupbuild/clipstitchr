import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createSwiprAutomationPexelsQuery(product: ProductProfile) {
  return [
    product.inferredProblem,
    product.audienceDetails,
    product.productDetails,
    product.name,
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 120);
}
