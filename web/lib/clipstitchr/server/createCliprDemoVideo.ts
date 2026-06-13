import type { Prediction } from "replicate";
import { cliprDemoVideoModelId } from "@/lib/clipstitchr/constants/cliprDemoVideoModelId";
import { createCliprDemoVideoInput } from "@/lib/clipstitchr/server/createCliprDemoVideoInput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprDemoVideoOptions = {
  demoClipName: string;
  demoVideoDescription?: string;
  durationSeconds: number;
  product: ProductProfile;
  referenceVideoUrl: string;
  replicate: ReplicateClient;
};

export async function createCliprDemoVideo({
  demoClipName,
  demoVideoDescription,
  durationSeconds,
  product,
  referenceVideoUrl,
  replicate,
}: CreateCliprDemoVideoOptions) {
  const prediction = await replicate.predictions.create({
    ...getReplicatePredictionModelReference(cliprDemoVideoModelId),
    input: createCliprDemoVideoInput({
      demoClipName,
      demoVideoDescription,
      durationSeconds,
      product,
      referenceVideoUrl,
    }),
  });
  const completedPrediction = await replicate.wait(prediction, {
    interval: 5000,
  });

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : "Replicate did not complete Clipr demo video generation.",
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
    modelId: cliprDemoVideoModelId,
    predictionId: completedPrediction.id,
  };
}
