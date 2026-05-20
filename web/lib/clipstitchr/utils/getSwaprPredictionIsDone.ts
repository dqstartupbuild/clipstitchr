import type { SwaprPredictionResponse } from "@/lib/clipstitchr/types/SwaprPredictionResponse";

export function getSwaprPredictionIsDone(prediction: SwaprPredictionResponse) {
  return (
    prediction.status === "succeeded" ||
    prediction.status === "failed" ||
    prediction.status === "canceled" ||
    prediction.status === "aborted"
  );
}
