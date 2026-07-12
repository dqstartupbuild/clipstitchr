import type { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";
import type { HookLabVariationDirection } from "@/lib/clipstitchr/types/HookLabVariationDirection";
import { createHookLabSafeAdaptation } from "./createHookLabSafeAdaptation";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type HookLabWriting = {
  generatedCaption: string;
  generatedHook: string;
  modelId: string;
  predictionIds: string[];
  rewriteCount: number;
  textDecision: "reused" | "adapted";
  textDecisionReason: string;
  visualPrompt: string;
  visualPromptSummary: string;
};

export async function resolveHookLabSiblingReservationConflict({
  audienceDetails,
  productName,
  replicate,
  siblingHooks,
  sourceText,
  textBlueprint,
  variationDirection,
  writing,
}: {
  audienceDetails: string;
  productName: string;
  replicate: ReplicateClient;
  siblingHooks: string[];
  sourceText: string;
  textBlueprint: HookLabTextBlueprint;
  variationDirection: HookLabVariationDirection;
  writing: HookLabWriting;
}): Promise<HookLabWriting> {
  const resolution = await createHookLabSafeAdaptation({
    allowRewrite: writing.rewriteCount === 0,
    audienceDetails,
    candidateText: writing.generatedHook,
    decision: "adapted",
    productName,
    replicate,
    siblingHooks,
    sourceText,
    textBlueprint,
    variationDirection,
  });

  return {
    ...writing,
    generatedHook: resolution.generatedHook,
    predictionIds: [...writing.predictionIds, ...resolution.predictionIds],
    rewriteCount: writing.rewriteCount + resolution.rewriteCount,
    textDecision: "adapted",
    textDecisionReason:
      "Another version already used overlapping wording, so this one was adapted.",
  };
}
