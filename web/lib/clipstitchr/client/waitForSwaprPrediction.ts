import type { SwaprPredictionResponse } from "@/lib/clipstitchr/types/SwaprPredictionResponse";
import { getSwaprPredictionIsDone } from "@/lib/clipstitchr/utils/getSwaprPredictionIsDone";
import { readSwaprPredictionResponse } from "@/lib/clipstitchr/utils/readSwaprPredictionResponse";
import { waitForSwaprPollInterval } from "@/lib/clipstitchr/utils/waitForSwaprPollInterval";

type WaitForSwaprPredictionOptions = {
  onStatusChange?: (prediction: SwaprPredictionResponse) => void;
  prediction: SwaprPredictionResponse;
};

export async function waitForSwaprPrediction({
  onStatusChange,
  prediction,
}: WaitForSwaprPredictionOptions) {
  let currentPrediction = prediction;

  while (!getSwaprPredictionIsDone(currentPrediction)) {
    await waitForSwaprPollInterval();

    const pollResponse = await fetch(`/api/swapr/jobs/${currentPrediction.id}`);
    currentPrediction = await readSwaprPredictionResponse(pollResponse);
    onStatusChange?.(currentPrediction);
  }

  if (currentPrediction.status !== "succeeded") {
    throw new Error(
      typeof currentPrediction.error === "string"
        ? currentPrediction.error
        : "Replicate did not complete this Swapr job.",
    );
  }

  return currentPrediction;
}
