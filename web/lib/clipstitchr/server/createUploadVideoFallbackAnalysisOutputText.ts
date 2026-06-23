import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createQwenVideoFallbackPredictionInput } from "@/lib/clipstitchr/server/createQwenVideoFallbackPredictionInput";
import { createUploadVideoFallbackAnalysisPrompt } from "@/lib/clipstitchr/server/createUploadVideoFallbackAnalysisPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import { getUploadVideoFallbackAnalysisModelId } from "@/lib/clipstitchr/server/getUploadVideoFallbackAnalysisModelId";
import { parseUploadAssetAnalysis } from "@/lib/clipstitchr/server/parseUploadAssetAnalysis";
import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createUploadVideoFallbackAnalysisOutputText({
  detectorCandidates = [],
  mediaKind,
  originalName,
  replicate,
  videoInput,
}: {
  detectorCandidates?: QuickEditCandidate[];
  mediaKind: UploadAssetAnalysisKind;
  originalName: string;
  replicate: ReplicateClient;
  videoInput: unknown;
}) {
  const prediction = await replicate.predictions.create({
    ...getReplicatePredictionModelReference(
      getUploadVideoFallbackAnalysisModelId(),
    ),
    input: createQwenVideoFallbackPredictionInput({
      videoInput,
      prompt: createUploadVideoFallbackAnalysisPrompt({
        detectorCandidates,
        mediaKind,
        originalName,
      }),
    }),
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage:
      "Replicate did not complete fallback video upload analysis.",
    prediction,
    replicate,
  });
  const analysis = parseUploadAssetAnalysis(outputText, originalName);

  if (!analysis.performanceScore) {
    throw new Error("Fallback video analysis did not return a score.");
  }

  return outputText;
}
