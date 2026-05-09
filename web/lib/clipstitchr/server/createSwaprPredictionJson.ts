import type { Prediction } from "replicate";
import type { SwaprPredictionResponse } from "@/lib/clipstitchr/types/SwaprPredictionResponse";

export function createSwaprPredictionJson(
  prediction: Prediction,
  overrides: Partial<SwaprPredictionResponse> = {},
): SwaprPredictionResponse {
  return {
    ...overrides,
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
