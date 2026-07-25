import { createFallbackProductEmotionalNarrative } from "@/lib/clipstitchr/server/createFallbackProductEmotionalNarrative";
import type { ProductEnrichment } from "@/lib/clipstitchr/types/ProductEnrichment";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export function createResolvedProductEnrichmentFields({
  enrichment,
  input,
  preferEnrichedProductDetails = false,
}: {
  enrichment: ProductEnrichment;
  input: ProductProfileCreateInput;
  preferEnrichedProductDetails?: boolean;
}) {
  const productDetails = preferEnrichedProductDetails
    ? enrichment.productDetails || input.productDetails || ""
    : input.productDetails || enrichment.productDetails || "";
  const audienceDetails =
    input.audienceDetails || enrichment.audienceDetails || "";
  const fallbackInput = {
    ...input,
    productDetails,
    audienceDetails,
  };

  return {
    productDetails,
    audienceDetails,
    emotionalNarrative:
      input.emotionalNarrative ||
      enrichment.emotionalNarrative ||
      createFallbackProductEmotionalNarrative(fallbackInput),
  };
}
