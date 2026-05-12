import type { Prediction } from "replicate";
import { createCliprSceneAvatarImagePrompt } from "@/lib/clipstitchr/server/createCliprSceneAvatarImagePrompt";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getCliprAvatarStillModelId } from "@/lib/clipstitchr/server/getCliprAvatarStillModelId";
import { getRemoteImageFile } from "@/lib/clipstitchr/server/getRemoteImageFile";
import { getReplicateOutputUrls } from "@/lib/clipstitchr/server/getReplicateOutputUrls";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprSceneAvatarImageOptions = {
  avatarDescription?: string;
  referenceImageUrl: string;
  replicate: ReplicateClient;
  scene: CliprScenePlan;
};

export async function createCliprSceneAvatarImage({
  avatarDescription,
  referenceImageUrl,
  replicate,
  scene,
}: CreateCliprSceneAvatarImageOptions) {
  const modelId = getCliprAvatarStillModelId();
  const prompt = createCliprSceneAvatarImagePrompt({
    avatarDescription,
    scene,
  });
  const referenceImage = await getRemoteImageFile(
    referenceImageUrl,
    "clipr-avatar-reference.jpg",
  );
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: {
      prompt,
      input_images: [referenceImage],
      aspect_ratio: "2:3",
      number_of_images: 1,
      output_format: "jpeg",
      quality: "medium",
      background: "opaque",
      moderation: "auto",
    },
  });
  const completedPrediction = await replicate.wait(prediction, {
    interval: 2000,
  });

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : "Replicate did not complete Clipr avatar still generation.",
    );
  }

  const outputUrl = getReplicateOutputUrls(
    (completedPrediction as Prediction).output,
  )[0];

  if (!outputUrl) {
    throw new Error("Replicate did not return a Clipr avatar still.");
  }

  const outputResponse = await fetchReplicateOutput(outputUrl);
  const contentType =
    outputResponse.headers.get("content-type") ?? "image/jpeg";
  const body = await outputResponse.arrayBuffer();

  return {
    body,
    contentType,
    modelId,
    outputUrl,
    predictionId: completedPrediction.id,
  };
}
