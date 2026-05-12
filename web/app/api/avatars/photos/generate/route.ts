import { NextResponse } from "next/server";
import type { Prediction } from "replicate";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createAvatarGenerationVariants } from "@/lib/clipstitchr/server/createAvatarGenerationVariants";
import { createAvatarPhotoGenerationInput } from "@/lib/clipstitchr/server/createAvatarPhotoGenerationInput";
import { createAvatarPhotoGenerationPrompt } from "@/lib/clipstitchr/server/createAvatarPhotoGenerationPrompt";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createReplicateImageDataUrl } from "@/lib/clipstitchr/server/createReplicateImageDataUrl";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getAvatarIdentityMode } from "@/lib/clipstitchr/server/getAvatarIdentityMode";
import { getAvatarLightingOption } from "@/lib/clipstitchr/server/getAvatarLightingOption";
import { getAvatarPhotoGenerationCount } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationCount";
import { getAvatarPhotoGenerationModelId } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationModelId";
import { getAvatarWardrobeStyle } from "@/lib/clipstitchr/server/getAvatarWardrobeStyle";
import { getAvatarStyleOption } from "@/lib/clipstitchr/server/getAvatarStyleOption";
import { getReplicateOutputUrls } from "@/lib/clipstitchr/server/getReplicateOutputUrls";
import { getReplicatePredictionStatus } from "@/lib/clipstitchr/server/getReplicatePredictionStatus";
import { getReplicatePredictionModelReference } from "@/lib/clipstitchr/server/getReplicatePredictionModelReference";
import { getSwaprFormFile } from "@/lib/clipstitchr/server/getSwaprFormFile";
import { getSwaprFormString } from "@/lib/clipstitchr/server/getSwaprFormString";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import type { GeneratedAvatarPhoto } from "@/lib/clipstitchr/types/GeneratedAvatarPhoto";
import { getGenerationSpeedTier } from "@/lib/clipstitchr/utils/getGenerationSpeedTier";
import { getGenerationSpeedTierProfile } from "@/lib/clipstitchr/utils/getGenerationSpeedTierProfile";
import { mapWithConcurrency } from "@/lib/clipstitchr/utils/mapWithConcurrency";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const formData = await request.formData();
    const image = getSwaprFormFile(formData, "image");
    const avatarDescription =
      getSwaprFormString(formData, "avatarDescription").trim();
    const count = getAvatarPhotoGenerationCount(
      getSwaprFormString(formData, "count"),
    );
    const context = getSwaprFormString(formData, "context").trim();
    const identityMode = getAvatarIdentityMode(
      getSwaprFormString(formData, "identityMode"),
    );
    const lighting = getAvatarLightingOption(
      getSwaprFormString(formData, "lighting"),
    );
    const location = getSwaprFormString(formData, "location").trim();
    const style = getAvatarStyleOption(getSwaprFormString(formData, "style"));
    const wardrobeStyle = getAvatarWardrobeStyle(
      getSwaprFormString(formData, "wardrobeStyle"),
    );
    const generationSpeedTier = getGenerationSpeedTier(
      getSwaprFormString(formData, "generationSpeedTier"),
    );
    const speedProfile = getGenerationSpeedTierProfile(generationSpeedTier);

    if (!avatarDescription) {
      throw new Error("Add an avatar description before creating photos.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const rateLimitSecret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeAvatarPhotoGenerate, {
      count,
      secret: rateLimitSecret,
    });

    const modelId = getAvatarPhotoGenerationModelId();
    const replicate = createReplicateClient();
    const imageBytes = await image.arrayBuffer();
    const imageName = image.name || "avatar-reference.jpg";
    const imageType = image.type || "image/jpeg";
    const variants = createAvatarGenerationVariants({
      context,
      count,
      lighting,
      location,
      style,
      wardrobeStyle,
    });

    const generatedImages = await mapWithConcurrency(
      variants,
      speedProfile.avatarImageConcurrency,
      async (variant) => {
        const prompt = createAvatarPhotoGenerationPrompt({
          avatarDescription,
          identityMode,
          modelId,
          variant,
        });
        const referenceImage = new File([imageBytes], imageName, {
          type: imageType,
        });

        const prediction = await replicate.predictions.create({
          ...getReplicatePredictionModelReference(modelId),
          input: createAvatarPhotoGenerationInput({
            image: referenceImage,
            modelId,
            prompt,
            quality: speedProfile.avatarImageQuality,
          }),
        });
        const createdAt = new Date().toISOString();

        await convex.mutation(api.replicateJobs.recordAvatarPhotoJob, {
          secret: rateLimitSecret,
          predictionId: prediction.id,
          modelId,
          status: getReplicatePredictionStatus(prediction.status),
          createdAt,
          updatedAt: createdAt,
        });

        const completedPrediction = await replicate.wait(prediction, {
          interval: 2000,
        });
        const completedStatus = getReplicatePredictionStatus(
          completedPrediction.status,
        );
        const predictionError =
          typeof completedPrediction.error === "string"
            ? completedPrediction.error
            : completedPrediction.error
              ? JSON.stringify(completedPrediction.error)
              : undefined;
        const outputUrl = getReplicateOutputUrls(
          (completedPrediction as Prediction).output,
        )[0];

        await convex.mutation(api.replicateJobs.updateAvatarPhotoJobStatus, {
          secret: rateLimitSecret,
          predictionId: prediction.id,
          status: completedStatus,
          outputUrl,
          error: predictionError,
          updatedAt: new Date().toISOString(),
        });

        if (completedPrediction.status !== "succeeded") {
          throw new Error(
            predictionError ??
            "Replicate did not complete avatar photo generation.",
          );
        }

        if (!outputUrl) {
          throw new Error("Replicate did not return a generated avatar photo.");
        }

        const imageData = await createReplicateImageDataUrl(outputUrl);

        return {
          image: {
            ...imageData,
            variant,
          } satisfies GeneratedAvatarPhoto,
          prompt,
        };
      },
    );

    return NextResponse.json({
      generationSpeedLabel: speedProfile.publicSpeedLabel,
      generationSpeedTier,
      images: generatedImages.map((generatedImage) => generatedImage.image),
      modelId,
      prompts: generatedImages.map((generatedImage) => generatedImage.prompt),
      quality: speedProfile.avatarImageQuality,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to generate avatar photos.",
      },
      { status: 500 },
    );
  }
}
