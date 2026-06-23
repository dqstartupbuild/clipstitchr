import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createStitchrBatchHookGenerationPrompt } from "@/lib/clipstitchr/server/createStitchrBatchHookGenerationPrompt";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";
import { getCliprTextSystemPrompt } from "@/lib/clipstitchr/server/getCliprTextSystemPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { parseStitchrBatchHookGenerationOutput } from "@/lib/clipstitchr/server/parseStitchrBatchHookGenerationOutput";
import type { StitchrBatchHookPlanningInput } from "@/lib/clipstitchr/types/StitchrBatchHookPlanningInput";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createStitchrBatchHookGeneration({
  inputs,
  replicate,
}: {
  inputs: StitchrBatchHookPlanningInput[];
  replicate: ReplicateClient;
}) {
  const providerModel = getCliprHookModelId();
  const prediction = await replicate.predictions.create({
    model: providerModel,
    input: createTextWritingPredictionInput({
      maxCompletionTokens: Math.min(16000, Math.max(3000, inputs.length * 1400)),
      modelId: providerModel,
      prompt: createStitchrBatchHookGenerationPrompt({ inputs }),
      systemPrompt: getCliprTextSystemPrompt("stitchr"),
    }),
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "Replicate did not complete Stitchr batch hook planning.",
    prediction,
    replicate,
  });

  return {
    plans: parseStitchrBatchHookGenerationOutput({
      outputText,
      providerModel,
      providerPredictionId: prediction.id,
    }),
    providerModel,
    providerPredictionId: prediction.id,
  };
}
