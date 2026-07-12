import type { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { decideHookLabExactTextReuse } from "@/lib/clipstitchr/server/hookLab/decideHookLabExactTextReuse";
import type { HookLabCreativeBeat } from "@/lib/clipstitchr/types/HookLabCreativeBeat";
import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";
import type { HookLabVariationDirection } from "@/lib/clipstitchr/types/HookLabVariationDirection";
import { createHookLabEnforcedVisualPrompt } from "./createHookLabEnforcedVisualPrompt";
import { createHookLabSafeAdaptation } from "./createHookLabSafeAdaptation";
import { createHookLabUseGenerationPrompt } from "./createHookLabUseGenerationPrompt";
import { createHookLabTextDecisionReason } from "./createHookLabTextDecisionReason";
import { getHookLabTextModelId } from "./getHookLabTextModelId";
import { parseHookLabUseGeneration } from "./parseHookLabUseGeneration";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateHookLabUseGenerationOptions = {
  audienceDetails: string;
  avoidPhrases: string[];
  creativeBeat: HookLabCreativeBeat;
  productDetails: string;
  productName: string;
  replicate: ReplicateClient;
  siblingHooks: string[];
  textBlueprint: HookLabTextBlueprint;
  variationDirection: HookLabVariationDirection;
};

export async function createHookLabUseGeneration(
  options: CreateHookLabUseGenerationOptions,
) {
  const modelId = getHookLabTextModelId();
  const prediction = await options.replicate.predictions.create({
    model: modelId,
    input: createTextWritingPredictionInput({
      maxCompletionTokens: 2_400,
      modelId,
      prompt: createHookLabUseGenerationPrompt(options),
      systemPrompt:
        "You make original, safe ad hooks from structured patterns. Return JSON only.",
      temperature: 0.7,
    }),
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "Hook Lab could not write this opening.",
    prediction,
    replicate: options.replicate,
  });
  const parsed = parseHookLabUseGeneration(outputText);
  const reuseDecision = decideHookLabExactTextReuse(parsed.exactReuseGates);
  const safeAdaptation = await createHookLabSafeAdaptation({
    audienceDetails: options.audienceDetails,
    candidateText:
      reuseDecision.decision === "reused"
        ? options.textBlueprint.sourceText
        : parsed.adaptedHook,
    decision: reuseDecision.decision,
    productName: options.productName,
    replicate: options.replicate,
    siblingHooks: options.siblingHooks,
    sourceText: options.textBlueprint.sourceText,
    textBlueprint: options.textBlueprint,
    variationDirection: options.variationDirection,
  });
  const generatedHook = safeAdaptation.generatedHook;
  const generatedVisualPrompt =
    parsed.visualPrompt ||
    "A natural creator reacts with curiosity in one steady vertical shot, then looks toward the upcoming product Demo.";

  return {
    generatedCaption:
      parsed.caption || `${generatedHook} See how ${options.productName} fits in.`,
    generatedHook,
    modelId,
    predictionIds: [prediction.id, ...safeAdaptation.predictionIds],
    rewriteCount: safeAdaptation.rewriteCount,
    textDecision: safeAdaptation.textDecision,
    textDecisionReason: safeAdaptation.forcedBySibling
      ? "Another version already used overlapping wording, so this one was adapted."
      : createHookLabTextDecisionReason({
          decision: safeAdaptation.textDecision,
          evidence: parsed.exactReuseEvidence,
          gates: parsed.exactReuseGates,
        }),
    visualPrompt: createHookLabEnforcedVisualPrompt(
      generatedVisualPrompt,
      options.variationDirection,
    ),
    visualPromptSummary: parsed.visualPromptSummary,
  };
}
