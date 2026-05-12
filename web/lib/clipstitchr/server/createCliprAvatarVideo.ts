import type { Prediction } from "replicate";
import { createCliprAvatarVideoInput } from "@/lib/clipstitchr/server/createCliprAvatarVideoInput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getCliprAvatarVideoModelId } from "@/lib/clipstitchr/server/getCliprAvatarVideoModelId";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprAvatarVideoOptions = {
  imageUrl: string;
  replicate: ReplicateClient;
  script: string;
  voiceId: string;
};

export async function createCliprAvatarVideo({
  imageUrl,
  replicate,
  script,
  voiceId,
}: CreateCliprAvatarVideoOptions) {
  const modelId = getCliprAvatarVideoModelId();
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: createCliprAvatarVideoInput({
      imageUrl,
      script,
      voiceId,
    }),
  });
  const completedPrediction = await replicate.wait(prediction, {
    interval: 5000,
  });

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : "Replicate did not complete Clipr avatar video generation.",
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
