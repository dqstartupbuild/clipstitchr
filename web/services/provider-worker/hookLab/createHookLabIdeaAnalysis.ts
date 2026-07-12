import type { Prediction } from "replicate";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getUploadVideoAnalysisModelId } from "@/lib/clipstitchr/server/getUploadVideoAnalysisModelId";
import type { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createHookLabIdeaAnalysisPrompt } from "./createHookLabIdeaAnalysisPrompt";
import { getHookLabTextModelId } from "./getHookLabTextModelId";
import { parseHookLabIdeaAnalysis } from "./parseHookLabIdeaAnalysis";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateHookLabIdeaAnalysisOptions = {
  onPredictionCreated?: (prediction: Prediction) => Promise<void> | void;
  originalText?: string;
  replicate: ReplicateClient;
  sourceContext?: Record<string, unknown>;
  sourceType: string;
  videoUrl?: string;
};

export async function createHookLabIdeaAnalysis({
  onPredictionCreated,
  originalText,
  replicate,
  sourceContext,
  sourceType,
  videoUrl,
}: CreateHookLabIdeaAnalysisOptions) {
  const prompt = createHookLabIdeaAnalysisPrompt({
    originalText,
    sourceContext,
    sourceType,
  });
  const modelId = videoUrl
    ? getUploadVideoAnalysisModelId()
    : getHookLabTextModelId();
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: videoUrl
      ? {
          videos: [videoUrl],
          prompt,
          system_instruction:
            "You extract safe reusable text structure and non-identifying creative beats from one source.",
          temperature: 0.2,
          thinking_level: "low",
          max_output_tokens: 3_200,
        }
      : createTextWritingPredictionInput({
          maxCompletionTokens: 3_200,
          modelId,
          prompt,
          systemPrompt:
            "You extract safe reusable text structure and non-identifying creative beats. Return JSON only.",
          temperature: 0.2,
        }),
  });

  await Promise.resolve(onPredictionCreated?.(prediction)).catch(() => {
    console.warn("Hook Lab prediction lineage checkpoint failed.");
  });

  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "Hook Lab could not finish analyzing this idea.",
    prediction,
    replicate,
  });

  return {
    ...parseHookLabIdeaAnalysis(outputText, originalText),
    modelId,
    predictionId: prediction.id,
  };
}
