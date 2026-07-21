import type { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import type { HookLabDestinationTool } from "@/lib/clipstitchr/types/HookLabDestinationTool";
import type { HookLabFormatDna } from "@/lib/clipstitchr/types/HookLabFormatDna";
import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { createHookLabCreativeBriefPrompt } from "./createHookLabCreativeBriefPrompt";
import { parseHookLabCreativeBrief } from "./parseHookLabCreativeBrief";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createHookLabCreativeBrief({
  destinationTool,
  formatDna,
  product,
  replicate,
  template,
}: {
  destinationTool: HookLabDestinationTool;
  formatDna: HookLabFormatDna;
  product: ProductProfile;
  replicate: ReplicateClient;
  template?: HookLibraryTemplateSummary;
}) {
  const modelId = getCliprHookModelId();
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: createTextWritingPredictionInput({
      maxCompletionTokens: 1_800,
      modelId,
      prompt: createHookLabCreativeBriefPrompt({
        destinationTool,
        formatDna,
        product,
        template,
      }),
      systemPrompt:
        "You turn observed short-form structure into original, product-grounded creative briefs. You never copy source language or invent claims. Return JSON only.",
      temperature: 0.55,
    }),
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "The creative brief could not be generated.",
    prediction,
    replicate,
  });

  return {
    brief: parseHookLabCreativeBrief(outputText),
    modelId,
    predictionId: prediction.id,
  };
}
