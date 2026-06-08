import type { Prediction } from "replicate";
import { DEFAULT_GENERATION_SPEED_TIER } from "@/lib/clipstitchr/constants/defaultGenerationSpeedTier";
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
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";
import { getGenerationSpeedTierProfile } from "@/lib/clipstitchr/utils/getGenerationSpeedTierProfile";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprSceneAvatarImageOptions = {
  avatarDescription?: string;
  referenceImageUrl: string;
  replicate: ReplicateClient;
  scene: CliprScenePlan;
  sceneControls?: AvatarSceneControls;
};

export async function createCliprSceneAvatarImage({
  avatarDescription,
  referenceImageUrl,
  replicate,
  scene,
  sceneControls,
}: CreateCliprSceneAvatarImageOptions) {
  const modelId = getCliprAvatarStillModelId();
  const speedProfile = getGenerationSpeedTierProfile(
    DEFAULT_GENERATION_SPEED_TIER,
  );
  const prompt = createAvatarPhotoGenerationPrompt({
    avatarDescription:
      avatarDescription?.trim() ||
      "Use the visible person in the reference image as the avatar.",
    identityMode: "same",
    modelId,
    variant: createCliprAvatarStillVariant(scene, sceneControls),
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
      quality: speedProfile.avatarImageQuality,
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
