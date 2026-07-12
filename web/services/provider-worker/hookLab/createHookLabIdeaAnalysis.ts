import { createReplicateInputFile } from "@/lib/clipstitchr/server/createReplicateInputFile";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getUploadVideoAnalysisModelId } from "@/lib/clipstitchr/server/getUploadVideoAnalysisModelId";
import type { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createHookLabIdeaAnalysisPrompt } from "./createHookLabIdeaAnalysisPrompt";
import { getHookLabTextModelId } from "./getHookLabTextModelId";
import { parseHookLabIdeaAnalysis } from "./parseHookLabIdeaAnalysis";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateHookLabIdeaAnalysisOptions = {
  originalText?: string;
  replicate: ReplicateClient;
  sourceContext?: Record<string, unknown>;
  sourceType: string;
  videoFile?: File;
};

export async function createHookLabIdeaAnalysis({
  originalText,
  replicate,
  sourceContext,
  sourceType,
  videoFile,
}: CreateHookLabIdeaAnalysisOptions) {
  const prompt = createHookLabIdeaAnalysisPrompt({
    originalText,
    sourceContext,
    sourceType,
  });
  const modelId = videoFile
    ? getUploadVideoAnalysisModelId()
    : getHookLabTextModelId();
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: videoFile
      ? {
          videos: [
            createReplicateInputFile({
              fallbackFileName: "hook-lab-source.mp4",
              file: videoFile,
              mimeType: videoFile.type || "video/mp4",
            }),
          ],
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
