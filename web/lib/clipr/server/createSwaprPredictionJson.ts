import type { Prediction } from "replicate";
import type { SwaprPredictionResponse } from "@/lib/clipr/types/SwaprPredictionResponse";

export function createSwaprPredictionJson(
  prediction: Prediction,
): SwaprPredictionResponse {
  return {
    id: prediction.id,
    status: prediction.status,
    output: prediction.output,
    error: prediction.error,
    logs: prediction.logs,
    urls: {
      get: prediction.urls.get,
      web: prediction.urls.web,
      cancel: prediction.urls.cancel,
    },
  };
}
