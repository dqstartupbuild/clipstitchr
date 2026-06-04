import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createProductEnrichmentPrompt } from "@/lib/clipstitchr/server/createProductEnrichmentPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getProductEnrichmentModelId } from "@/lib/clipstitchr/server/getProductEnrichmentModelId";
import { parseProductEnrichmentOutputText } from "@/lib/clipstitchr/server/parseProductEnrichmentOutputText";
import type { ProductEnrichmentInput } from "@/lib/clipstitchr/types/ProductEnrichmentInput";

const PRODUCT_ENRICHMENT_SYSTEM_PROMPT =
  "You enrich concise product profiles for a marketing creative workflow. Return valid JSON only.";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createProductEnrichment({
  product,
  replicate,
}: {
  product: ProductEnrichmentInput;
  replicate: ReplicateClient;
}) {
  const prediction = await replicate.predictions.create({
    model: getProductEnrichmentModelId(),
    input: {
      prompt: createProductEnrichmentPrompt(product),
      system_prompt: PRODUCT_ENRICHMENT_SYSTEM_PROMPT,
      temperature: 0.2,
      max_completion_tokens: 12000,
    },
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "Replicate did not complete product enrichment.",
    prediction,
    replicate,
  });

  return parseProductEnrichmentOutputText(outputText);
}
