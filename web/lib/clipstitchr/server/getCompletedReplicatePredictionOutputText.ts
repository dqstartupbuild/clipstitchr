import type { Prediction } from "replicate";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getUploadAnalysisOutputText } from "@/lib/clipstitchr/server/getUploadAnalysisOutputText";
import { logGeminiVideoAnalysisPredictionDiagnostics } from "@/lib/clipstitchr/server/logGeminiVideoAnalysisPredictionDiagnostics";
import type { GeminiVideoAnalysisPredictionDiagnostics } from "@/lib/clipstitchr/types/GeminiVideoAnalysisPredictionDiagnostics";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function getCompletedReplicatePredictionOutputText({
  failureMessage,
  prediction,
  predictionDiagnostics,
  replicate,
}: {
  failureMessage: string;
  prediction: Prediction;
  predictionDiagnostics?: GeminiVideoAnalysisPredictionDiagnostics;
  replicate: ReplicateClient;
}) {
  const completedPrediction = await replicate.wait(prediction, {
    interval: 1000,
  });

  if (predictionDiagnostics) {
    logGeminiVideoAnalysisPredictionDiagnostics({
      diagnostics: predictionDiagnostics,
      prediction: completedPrediction,
    });
  }

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : failureMessage,
    );
  }

  return getUploadAnalysisOutputText((completedPrediction as Prediction).output);
}
