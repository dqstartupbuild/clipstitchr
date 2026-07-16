import type { Prediction } from "replicate";
import { createAvatarPhotoGenerationInput } from "@/lib/clipstitchr/server/createAvatarPhotoGenerationInput";
import { createAvatarPhotoGenerationPrompt } from "@/lib/clipstitchr/server/createAvatarPhotoGenerationPrompt";
import { createCliprAvatarStillVariant } from "@/lib/clipstitchr/server/createCliprAvatarStillVariant";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getCliprAvatarStillModelId } from "@/lib/clipstitchr/server/getCliprAvatarStillModelId";
import { getRemoteImageFile } from "@/lib/clipstitchr/server/getRemoteImageFile";
import { getReplicateOutputUrls } from "@/lib/clipstitchr/server/getReplicateOutputUrls";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import type { AvatarSceneControls } from "@/lib/clipstitchr/types/AvatarSceneControls";
import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";
import type { AvatarImageGenerationQuality } from "@/lib/clipstitchr/types/AvatarImageGenerationQuality";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprSceneAvatarImageOptions = {
  avatarDescription?: string;
  referenceImageUrl: string;
  replicate: ReplicateClient;
  scene: CliprScenePlan;
  sceneControls?: AvatarSceneControls;
  generationMode?: CliprResolvedGenerationMode;
  quality: AvatarImageGenerationQuality;
};

export async function createCliprSceneAvatarImage({
  avatarDescription,
  referenceImageUrl,
  replicate,
  scene,
  sceneControls,
  generationMode,
  quality,
}: CreateCliprSceneAvatarImageOptions) {
  const modelId = getCliprAvatarStillModelId();
  const prompt = createAvatarPhotoGenerationPrompt({
    avatarDescription:
      avatarDescription?.trim() ||
      "Use the visible person in the reference image as the avatar.",
    identityMode: "same",
    modelId,
    variant: createCliprAvatarStillVariant(
      scene,
      sceneControls,
      generationMode,
    ),
  });
  const referenceImage = await getRemoteImageFile(
    referenceImageUrl,
    "clipr-avatar-reference.jpg",
  );
  const prediction = await replicate.predictions.create({
    ...getReplicatePredictionModelReference(modelId),
    input: createAvatarPhotoGenerationInput({
      image: referenceImage,
      modelId,
      prompt,
      quality,
    }),
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
