import { createSwiprBatchTextGenerationPrompt } from "@/lib/clipstitchr/server/createSwiprBatchTextGenerationPrompt";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";
import { getCliprTextSystemPrompt } from "@/lib/clipstitchr/server/getCliprTextSystemPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { parseSwiprGeneratedSlideshows } from "@/lib/clipstitchr/server/parseSwiprGeneratedSlideshows";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";
import type { Prediction } from "replicate";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createSwiprBatchTextGeneration({
  callToActionStyle = "any",
  count,
  creativeContext = "",
  product,
  prediction: existingPrediction,
  replicate,
  onPredictionCreated,
  slideCount,
}: {
  callToActionStyle?: SwiprCallToActionStyle;
  count: number;
  creativeContext?: string;
  product: ProductProfile;
  prediction?: Prediction;
  replicate: ReplicateClient;
  onPredictionCreated?: (prediction: Prediction) => void | Promise<void>;
  slideCount: number;
}) {
  const providerModel = getCliprHookModelId();
  const prediction =
    existingPrediction ??
    (await replicate.predictions.create({
      model: providerModel,
      input: createTextWritingPredictionInput({
        maxCompletionTokens: Math.min(24000, Math.max(6000, count * 2500)),
        modelId: providerModel,
        prompt: createSwiprBatchTextGenerationPrompt({
          callToActionStyle,
          count,
          creativeContext,
          product,
          slideCount,
        }),
        systemPrompt: getCliprTextSystemPrompt("swipr"),
      }),
    }));

  await onPredictionCreated?.(prediction);
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
      product,
      slideCount,
    }),
  };
}
