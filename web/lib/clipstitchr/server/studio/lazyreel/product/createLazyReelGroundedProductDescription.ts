import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { truncateLazyReelProductField } from "./truncateLazyReelProductField";

export function createLazyReelGroundedProductDescription(
  product: ProductProfile,
) {
  const details = truncateLazyReelProductField(product.productDetails, 2_500);
  const audience = truncateLazyReelProductField(product.audienceDetails, 1_200);
  const emotionalNarrative = truncateLazyReelProductField(
    product.emotionalNarrative,
    800,
  );
  const painPoints = product.inferredPainPoints
    .slice(0, 8)
    .map((painPoint) => truncateLazyReelProductField(painPoint, 180))
    .filter(Boolean)
    .join("; ");

  return [
    `Product name: ${truncateLazyReelProductField(product.name, 180)}`,
    details ? `Saved product facts: ${details}` : "",
    audience ? `Saved audience: ${audience}` : "",
    emotionalNarrative ? `Saved emotional narrative: ${emotionalNarrative}` : "",
    painPoints ? `Saved pain points: ${painPoints}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
