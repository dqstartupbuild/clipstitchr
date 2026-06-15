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
  let completedPrediction: Prediction;

  try {
    completedPrediction = await replicate.wait(prediction, {
      interval: 1000,
    });
  } catch (error) {
    if (predictionDiagnostics) {
      const latestPrediction = await replicate.predictions
        .get(prediction.id)
        .catch(() => undefined);

      logGeminiVideoAnalysisPredictionDiagnostics({
        diagnostics: predictionDiagnostics,
        error,
        prediction: latestPrediction ?? prediction,
      });
    }

    throw error;
  }

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
