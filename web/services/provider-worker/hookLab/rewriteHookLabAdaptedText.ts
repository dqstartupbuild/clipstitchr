import type { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";
import type { HookLabVariationDirection } from "@/lib/clipstitchr/types/HookLabVariationDirection";
import { createHookLabAdaptedTextRewritePrompt } from "./createHookLabAdaptedTextRewritePrompt";
import { getHookLabTextModelId } from "./getHookLabTextModelId";
import { parseHookLabAdaptedTextRewrite } from "./parseHookLabAdaptedTextRewrite";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function rewriteHookLabAdaptedText({
  candidateText,
  productName,
  replicate,
  siblingHooks,
  sourceText,
  textBlueprint,
  variationDirection,
}: {
  candidateText: string;
  productName: string;
  replicate: ReplicateClient;
  siblingHooks: string[];
  sourceText: string;
  textBlueprint: HookLabTextBlueprint;
  variationDirection: HookLabVariationDirection;
}) {
  const modelId = getHookLabTextModelId();
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: createTextWritingPredictionInput({
      maxCompletionTokens: 500,
      modelId,
      prompt: createHookLabAdaptedTextRewritePrompt({
        candidateText,
        productName,
        siblingHooks,
        sourceText,
        textBlueprint,
        variationDirection,
      }),
      systemPrompt:
        "You rewrite too-similar hooks into materially original hooks. Return JSON only.",
      temperature: 0.85,
    }),
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "Hook Lab could not safely rewrite this opening.",
    prediction,
    replicate,
  });

  return {
    adaptedHook: parseHookLabAdaptedTextRewrite(outputText),
    predictionId: prediction.id,
  };
}
