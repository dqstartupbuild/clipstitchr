import { NextResponse } from "next/server";
import type { Prediction } from "replicate";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createAvatarGenerationVariants } from "@/lib/clipstitchr/server/createAvatarGenerationVariants";
import { createAvatarPhotoGenerationPrompt } from "@/lib/clipstitchr/server/createAvatarPhotoGenerationPrompt";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createReplicateImageDataUrl } from "@/lib/clipstitchr/server/createReplicateImageDataUrl";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getAvatarLightingOption } from "@/lib/clipstitchr/server/getAvatarLightingOption";
import { getAvatarPhotoGenerationCount } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationCount";
import { getAvatarPhotoGenerationModelId } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationModelId";
import { getAvatarStyleOption } from "@/lib/clipstitchr/server/getAvatarStyleOption";
import { getReplicateOutputUrls } from "@/lib/clipstitchr/server/getReplicateOutputUrls";
import { getReplicatePredictionStatus } from "@/lib/clipstitchr/server/getReplicatePredictionStatus";
import { getSwaprFormFile } from "@/lib/clipstitchr/server/getSwaprFormFile";
import { getSwaprFormString } from "@/lib/clipstitchr/server/getSwaprFormString";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import type { GeneratedAvatarPhoto } from "@/lib/clipstitchr/types/GeneratedAvatarPhoto";

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
    const lighting = getAvatarLightingOption(
      getSwaprFormString(formData, "lighting"),
    );
    const location = getSwaprFormString(formData, "location").trim();
    const style = getAvatarStyleOption(getSwaprFormString(formData, "style"));

    if (!avatarDescription) {
      throw new Error("Add an avatar description before generating photos.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const rateLimitSecret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeAvatarPhotoGenerate, {
      count,
      secret: rateLimitSecret,
    });

    const modelId = getAvatarPhotoGenerationModelId();
    const replicate = createReplicateClient();
    const images: GeneratedAvatarPhoto[] = [];
    const prompts: string[] = [];
    const variants = createAvatarGenerationVariants({
      count,
      lighting,
      location,
      style,
    });

    for (const variant of variants) {
      const prompt = createAvatarPhotoGenerationPrompt({
        avatarDescription,
        variant,
      });

      prompts.push(prompt);

      const prediction = await replicate.predictions.create({
        model: modelId,
        input: {
          prompt,
          input_images: [image],
          aspect_ratio: "2:3",
          number_of_images: 1,
          output_format: "jpeg",
          quality: "auto",
          background: "opaque",
          moderation: "auto",
        },
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
          predictionError ?? "Replicate did not complete avatar photo generation.",
        );
      }

      if (!outputUrl) {
        throw new Error("Replicate did not return a generated avatar photo.");
      }

      const imageData = await createReplicateImageDataUrl(outputUrl);

      images.push({
        ...imageData,
        variant,
      });
    }

    return NextResponse.json({
      images,
      modelId,
      prompts,
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
