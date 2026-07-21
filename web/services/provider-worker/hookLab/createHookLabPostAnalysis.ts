import type { Prediction } from "replicate";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getUploadVideoAnalysisModelId } from "@/lib/clipstitchr/server/getUploadVideoAnalysisModelId";
import type { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { HookLabPostMetrics } from "@/lib/clipstitchr/types/HookLabPostMetrics";
import type { HookLabPostMediaKind } from "@/lib/clipstitchr/types/HookLabPostMediaKind";
import type { HookLabPostPlatform } from "@/lib/clipstitchr/types/HookLabPostPlatform";
import { createHookLabPostAnalysisPrompt } from "./createHookLabPostAnalysisPrompt";
import { parseHookLabPostAnalysis } from "./parseHookLabPostAnalysis";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createHookLabPostAnalysis({
  durationSeconds,
  metrics,
  mediaKind,
  onPredictionCreated,
  platform,
  replicate,
  sourceCreatedAt,
  sourceText,
  videoUrl,
}: {
  durationSeconds: number;
  metrics: HookLabPostMetrics;
  mediaKind: HookLabPostMediaKind;
  onPredictionCreated?: (prediction: Prediction) => Promise<void> | void;
  platform: HookLabPostPlatform;
  replicate: ReplicateClient;
  sourceCreatedAt?: string;
  sourceText?: string;
  videoUrl: string;
}) {
  const modelId = getUploadVideoAnalysisModelId();
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: {
      videos: [videoUrl],
      prompt: createHookLabPostAnalysisPrompt({
        durationSeconds,
        mediaKind,
        metrics,
        platform,
        sourceCreatedAt,
        sourceText,
      }),
      system_instruction:
        "You are a rigorous short-form video analyst. You separate observed evidence, platform metrics, and inference. Return JSON only.",
      temperature: 0.2,
      thinking_level: "low",
      max_output_tokens: 8_000,
    },
  });

  await Promise.resolve(onPredictionCreated?.(prediction)).catch(() => {
    console.warn("Hook Lab prediction lineage checkpoint failed.");
  });

  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "Hook Lab could not finish analyzing this post.",
    prediction,
    replicate,
  });

  return {
    analysis: parseHookLabPostAnalysis(outputText, durationSeconds, sourceText),
    modelId,
    predictionId: prediction.id,
  };
}
