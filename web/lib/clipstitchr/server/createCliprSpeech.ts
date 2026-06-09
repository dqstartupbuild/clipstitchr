import type { Prediction } from "replicate";
import { createCliprElevenLabsSpeechInput } from "@/lib/clipstitchr/server/createCliprElevenLabsSpeechInput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import type { CliprTtsModelId } from "@/lib/clipstitchr/types/CliprTtsModelId";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprSpeechOptions = {
  modelId: CliprTtsModelId;
  replicate: ReplicateClient;
  script: string;
  voiceId: string;
};

export async function createCliprSpeech({
  modelId,
  replicate,
  script,
  voiceId,
}: CreateCliprSpeechOptions) {
  if (modelId === "none") {
    return null;
  }

  const prediction = await replicate.predictions.create({
    ...getReplicatePredictionModelReference(modelId),
    input: createCliprElevenLabsSpeechInput({
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
        : "Replicate did not complete Clipr speech generation.",
    );
  }

  const outputUrl = getReplicateOutputUrl(
    (completedPrediction as Prediction).output,
  );
  const outputResponse = await fetchReplicateOutput(outputUrl);
  const contentType =
    outputResponse.headers.get("content-type") ?? "audio/mpeg";
  const body = await outputResponse.arrayBuffer();

  return {
    body,
    contentType,
    modelId,
    outputUrl,
    predictionId: completedPrediction.id,
  };
}
