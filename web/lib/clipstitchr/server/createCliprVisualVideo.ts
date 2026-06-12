import type { Prediction } from "replicate";
import { createCliprVisualVideoInput } from "@/lib/clipstitchr/server/createCliprVisualVideoInput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprVisualVideoOptions = {
  durationSeconds: number;
  imageUrl: string;
  modelId: Exclude<CliprVideoModelId, "auto" | "prunaai/p-video-avatar">;
  prompt: string;
  replicate: ReplicateClient;
};

export async function createCliprVisualVideo({
  durationSeconds,
  imageUrl,
  modelId,
  prompt,
  replicate,
}: CreateCliprVisualVideoOptions) {
  const prediction = await replicate.predictions.create({
    ...getReplicatePredictionModelReference(modelId),
    input: createCliprVisualVideoInput({
      durationSeconds,
      imageUrl,
      modelId,
      prompt,
    }),
  });
  const completedPrediction = await replicate.wait(prediction, {
    interval: 5000,
  });

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : "Replicate did not complete Clipr visual video generation.",
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
    predictionId: completedPrediction.id,
  };
}
