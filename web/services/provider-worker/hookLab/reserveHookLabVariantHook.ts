import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const api = anyApi;

export async function reserveHookLabVariantHook({
  client,
  generatedCaption,
  generatedHook,
  ownerId,
  predictionIds,
  providerWorkerSecret,
  textDecision,
  textDecisionReason,
  updatedAt,
  variantId,
  visualPrompt,
  visualPromptSummary,
}: {
  client: ConvexHttpClient;
  generatedCaption: string;
  generatedHook: string;
  ownerId: string;
  predictionIds: string[];
  providerWorkerSecret: string;
  textDecision: "reused" | "adapted";
  textDecisionReason: string;
  updatedAt: string;
  variantId: string;
  visualPrompt: string;
  visualPromptSummary: string;
}) {
  return (await client.mutation(
    api["hookLabIdeaVariants/markGeneratingFromProvider"]
      .markGeneratingFromProvider,
    {
      secret: providerWorkerSecret,
      ownerId,
      id: variantId,
      generatedCaption,
      generatedHook,
      providerPredictionIds: predictionIds,
      textDecision,
      textDecisionReason,
      visualPrompt,
      visualPromptSummary,
      updatedAt,
    },
  )) as {
    accepted: boolean;
    id: string;
    siblingHooks: string[];
  };
}
