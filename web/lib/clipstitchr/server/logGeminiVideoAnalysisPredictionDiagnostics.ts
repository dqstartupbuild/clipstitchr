import type { Prediction } from "replicate";
import { getGeminiVideoAnalysisErrorMessage } from "@/lib/clipstitchr/server/getGeminiVideoAnalysisErrorMessage";
import type { GeminiVideoAnalysisPredictionDiagnostics } from "@/lib/clipstitchr/types/GeminiVideoAnalysisPredictionDiagnostics";

export function logGeminiVideoAnalysisPredictionDiagnostics({
  diagnostics,
  error,
  prediction,
}: {
  diagnostics: GeminiVideoAnalysisPredictionDiagnostics;
  error?: unknown;
  prediction?: Pick<Prediction, "error" | "id" | "status">;
}) {
  console.info(
    JSON.stringify({
      event: "gemini-video-analysis-prediction",
      featurePath: diagnostics.featurePath,
      modelId: diagnostics.modelId,
      predictionId: prediction?.id,
      predictionStatus: prediction?.status,
      predictionError: getGeminiVideoAnalysisErrorMessage(
        prediction?.error ?? error,
      ),
    }),
  );
}
