import type { Prediction } from "replicate";
import { createCliprMusicInput } from "@/lib/clipstitchr/server/createCliprMusicInput";
import { createCliprMusicPrompt } from "@/lib/clipstitchr/server/createCliprMusicPrompt";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getCliprMusicModelId } from "@/lib/clipstitchr/server/getCliprMusicModelId";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { cliprMusicGenerationDefaults } from "@/lib/clipstitchr/constants/cliprMusicGenerationDefaults";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprMusicOptions = {
  audienceDetails: string;
  productName: string;
  replicate: ReplicateClient;
  script: string;
};

export async function createCliprMusic({
  audienceDetails,
  productName,
  replicate,
  script,
}: CreateCliprMusicOptions) {
  const modelId = getCliprMusicModelId();
  const prompt = createCliprMusicPrompt({
    audienceDetails,
    productName,
    script,
  });
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: createCliprMusicInput({ prompt }),
  });
  const completedPrediction = await replicate.wait(prediction, {
    interval: 5000,
  });

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : "Replicate did not complete Clipr music generation.",
    );
  }

  const outputUrl = getReplicateOutputUrl(
    (completedPrediction as Prediction).output,
  );
  const outputResponse = await fetchReplicateOutput(outputUrl);
  const outputContentType = outputResponse.headers.get("content-type");
  const contentType =
    outputContentType && outputContentType !== "application/octet-stream"
      ? outputContentType
      : "audio/mpeg";
  const body = await outputResponse.arrayBuffer();

  return {
    body,
    contentType,
    durationSeconds: cliprMusicGenerationDefaults.durationSeconds,
    modelId,
    predictionId: completedPrediction.id,
    prompt,
  };
}
