import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getUploadAnalysisModelIds } from "@/lib/clipstitchr/server/getUploadAnalysisModelIds";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createUploadAnalysisPredictionOutputText({
  failureMessage,
  imageInput,
  maxCompletionTokens,
  prompt,
  replicate,
  systemPrompt,
}: {
  failureMessage: string;
  imageInput?: File;
  maxCompletionTokens: number;
  prompt: string;
  replicate: ReplicateClient;
  systemPrompt: string;
}) {
  let lastError: unknown;

  for (const modelId of getUploadAnalysisModelIds()) {
    try {
      const prediction = await replicate.predictions.create({
        model: modelId,
        input: {
          ...(imageInput ? { image_input: [imageInput] } : {}),
          prompt,
          system_prompt: systemPrompt,
          temperature: 0.2,
          max_completion_tokens: maxCompletionTokens,
        },
      });

      return await getCompletedReplicatePredictionOutputText({
        failureMessage,
        prediction,
        replicate,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(failureMessage);
}
