import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export function createFallbackProductEmotionalNarrative(
  product: ProductProfileCreateInput,
) {
  const audience = product.audienceDetails.trim() || `people considering ${product.name}`;
  const details = product.productDetails.trim() || product.name;

  return `${audience} feel some tension around ${details}. They want to move from doubt, frustration, or uncertainty into a version of themselves that feels more capable, confident, and validated. The hooks should imply a small emotional story where someone is surprised, proven wrong, or starts seeing visible proof that the change is real.`;
}
