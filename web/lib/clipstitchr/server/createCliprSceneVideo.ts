import type { Prediction } from "replicate";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createCliprScenePrompt } from "@/lib/clipstitchr/server/createCliprScenePrompt";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getCliprSceneModelId } from "@/lib/clipstitchr/server/getCliprSceneModelId";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprSceneVideoOptions = {
  imageUrl?: string;
  replicate: ReplicateClient;
  scene: CliprScenePlan;
};

export async function createCliprSceneVideo({
  imageUrl,
  replicate,
  scene,
}: CreateCliprSceneVideoOptions) {
  const modelId = getCliprSceneModelId();
  const duration = Math.min(
    15,
    Math.max(4, Math.round(scene.estimatedDurationSeconds)),
  );
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: {
      prompt: createCliprScenePrompt(scene),
      duration,
      resolution: "720p",
      fps: 24,
      draft: false,
      aspect_ratio: "9:16",
      prompt_upsampling: true,
      save_audio: false,
      ...(imageUrl && scene.sceneType === "avatar"
        ? { image: imageUrl }
        : {}),
    },
  });
  const completedPrediction = await replicate.wait(prediction, {
    interval: 5000,
  });

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : "Replicate did not complete Clipr scene generation.",
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
