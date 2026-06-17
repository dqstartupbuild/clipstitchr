import { createSwiprBatchTextGenerationPrompt } from "@/lib/clipstitchr/server/createSwiprBatchTextGenerationPrompt";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";
import { getCliprTextSystemPrompt } from "@/lib/clipstitchr/server/getCliprTextSystemPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { parseSwiprGeneratedSlideshows } from "@/lib/clipstitchr/server/parseSwiprGeneratedSlideshows";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createSwiprBatchTextGeneration({
  count,
  product,
  replicate,
  slideCount,
}: {
  count: number;
  product: ProductProfile;
  replicate: ReplicateClient;
  slideCount: number;
}) {
  const providerModel = getCliprHookModelId();
  const prediction = await replicate.predictions.create({
    model: providerModel,
    input: createTextWritingPredictionInput({
      maxCompletionTokens: 6000,
      modelId: providerModel,
      prompt: createSwiprBatchTextGenerationPrompt({
        count,
        product,
        slideCount,
      }),
      systemPrompt: getCliprTextSystemPrompt("swipr"),
    }),
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "Replicate did not complete Swipr text generation.",
    prediction,
    replicate,
  });

  return {
    providerModel,
    providerPredictionId: prediction.id,
    slideshows: parseSwiprGeneratedSlideshows({
      count,
      outputText,
      slideCount,
    }),
  };
}
