import type { Prediction } from "replicate";
import { createCliprLipSyncVideoInput } from "@/lib/clipstitchr/server/createCliprLipSyncVideoInput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import type { CliprLipSyncModelId } from "@/lib/clipstitchr/types/CliprLipSyncModelId";

type ReplicateClient = ReturnType<typeof createReplicateClient>;
type ActiveCliprLipSyncModelId = Exclude<CliprLipSyncModelId, "none">;

type CreateCliprLipSyncVideoOptions = {
  audioUrl: string;
  modelId: ActiveCliprLipSyncModelId;
  replicate: ReplicateClient;
  videoUrl: string;
};

export async function createCliprLipSyncVideo({
  audioUrl,
  modelId,
  replicate,
  videoUrl,
}: CreateCliprLipSyncVideoOptions) {
  const prediction = await replicate.predictions.create({
    ...getReplicatePredictionModelReference(modelId),
    input: createCliprLipSyncVideoInput({
      audioUrl,
      modelId,
      videoUrl,
    }),
  });
  const completedPrediction = await replicate.wait(prediction, {
    interval: 5000,
  });

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : "Replicate did not complete Clipr lip sync generation.",
    );
  }

  const outputUrl = getReplicateOutputUrl(
    (completedPrediction as Prediction).output,
  );
  const outputResponse = await fetchReplicateOutput(outputUrl);
  const contentType =
    outputResponse.headers.get("content-type") ?? "video/mp4";
  const body = await outputResponse.arrayBuffer();

  return {
    body,
    contentType,
    modelId,
    outputUrl,
    predictionId: completedPrediction.id,
  };
}
