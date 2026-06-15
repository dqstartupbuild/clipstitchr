import type { Prediction } from "replicate";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getUploadAnalysisOutputText } from "@/lib/clipstitchr/server/getUploadAnalysisOutputText";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function getCompletedReplicatePredictionOutputText({
  failureMessage,
  prediction,
  replicate,
}: {
  failureMessage: string;
  prediction: Prediction;
  replicate: ReplicateClient;
}) {
  const completedPrediction = await replicate.wait(prediction, {
    interval: 1000,
  });

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : failureMessage,
    );
  }

  return getUploadAnalysisOutputText((completedPrediction as Prediction).output);
}
