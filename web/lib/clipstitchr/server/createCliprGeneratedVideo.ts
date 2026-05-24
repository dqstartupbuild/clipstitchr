import type { Prediction } from "replicate";
import { createCliprGeneratedVideoInput } from "@/lib/clipstitchr/server/createCliprGeneratedVideoInput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getCliprGeneratedVideoModelId } from "@/lib/clipstitchr/server/getCliprGeneratedVideoModelId";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprGeneratedVideoOptions = {
  durationSeconds: number;
  imageUrl?: string;
  prompt: string;
  replicate: ReplicateClient;
};

export async function createCliprGeneratedVideo({
  durationSeconds,
  imageUrl,
  prompt,
  replicate,
}: CreateCliprGeneratedVideoOptions) {
  const modelId = getCliprGeneratedVideoModelId();
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: createCliprGeneratedVideoInput({
      durationSeconds,
      imageUrl,
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
        : "Replicate did not complete Clipr generated video.",
    );
  }

  const outputUrl = getReplicateOutputUrl(
    (completedPrediction as Prediction).output,
  );
  const outputResponse = await fetchReplicateOutput(outputUrl);
  const contentType = outputResponse.headers.get("content-type") ?? "video/mp4";
  const body = await outputResponse.arrayBuffer();

  return {
    body,
    contentType,
    modelId,
    predictionId: completedPrediction.id,
  };
}
