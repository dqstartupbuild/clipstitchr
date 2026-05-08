import type { SwaprPredictionStatus } from "@/lib/clipstitchr/types/SwaprPredictionStatus";

const REPLICATE_PREDICTION_STATUSES = new Set<string>([
  "starting",
  "processing",
  "succeeded",
  "failed",
  "canceled",
  "aborted",
]);

export function getReplicatePredictionStatus(
  status: string,
): SwaprPredictionStatus {
  if (!REPLICATE_PREDICTION_STATUSES.has(status)) {
    throw new Error("Unsupported Replicate prediction status.");
  }

  return status as SwaprPredictionStatus;
}
