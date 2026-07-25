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
        "You write original short-form product ads through functional adaptation. The saved product record is the only authority for product behavior and claims. Transfer the reference's communication structure, pacing, and narrative jobs, never its unsupported capabilities or literal product mechanic. Return JSON only.",
      temperature: 0.35,
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
