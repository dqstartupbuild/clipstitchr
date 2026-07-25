import type { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { createHookLabCreativeBriefPrompt } from "./createHookLabCreativeBriefPrompt";
import { parseHookLabCreativeBrief } from "./parseHookLabCreativeBrief";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createHookLabCreativeBrief({
  analysis,
  product,
  replicate,
  sourceText,
}: {
  analysis: HookLabPostAnalysis;
  product: ProductProfile;
  replicate: ReplicateClient;
  sourceText?: string;
}) {
  const modelId = getCliprHookModelId();
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: createTextWritingPredictionInput({
      maxCompletionTokens: 5_000,
      modelId,
      prompt: createHookLabCreativeBriefPrompt({
        analysis,
        product,
        sourceText,
      }),
      systemPrompt:
        "You adapt short-form product ads with the minimum necessary change. Preserve every reference element that remains compatible with the saved product, including the hook shape, setting, actions, props, shot order, pacing, progress device, and payoff. Replace only unsupported product claims, causal mechanics, UI behavior, creator identity, and distinctive wording. The saved product record is the only authority for product behavior and claims. Return JSON only.",
      temperature: 0.25,
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
