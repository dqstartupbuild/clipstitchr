import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createSwaprPredictionJson } from "@/lib/clipstitchr/server/createSwaprPredictionJson";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getReplicatePredictionStatus } from "@/lib/clipstitchr/server/getReplicatePredictionStatus";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getSwaprCharacterOrientation } from "@/lib/clipstitchr/server/getSwaprCharacterOrientation";
import { getSwaprFormBoolean } from "@/lib/clipstitchr/server/getSwaprFormBoolean";
import { getSwaprFormFile } from "@/lib/clipstitchr/server/getSwaprFormFile";
import { getSwaprFormString } from "@/lib/clipstitchr/server/getSwaprFormString";
import { getSwaprMode } from "@/lib/clipstitchr/server/getSwaprMode";
import { getGenerationSpeedTier } from "@/lib/clipstitchr/utils/getGenerationSpeedTier";
import { getGenerationSpeedTierProfile } from "@/lib/clipstitchr/utils/getGenerationSpeedTierProfile";
import { getSwaprReferenceDurationLimit } from "@/lib/clipstitchr/utils/getSwaprReferenceDurationLimit";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";

export const runtime = "nodejs";

const SWAPR_MODEL_ID = "kwaivgi/kling-v3-motion-control";

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

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();
    const formData = await request.formData();
    const image = getSwaprFormFile(formData, "image");
    const video = getSwaprFormFile(formData, "video");
    const prompt = getSwaprFormString(formData, "prompt").trim();
    const requestedMode = getSwaprMode(getSwaprFormString(formData, "mode"));
    const requestedCharacterOrientation = getSwaprCharacterOrientation(
      getSwaprFormString(formData, "characterOrientation"),
    );
    const generationSpeedTier = formData.has("generationSpeedTier")
      ? getGenerationSpeedTier(getSwaprFormString(formData, "generationSpeedTier"))
      : undefined;
    const speedProfile = generationSpeedTier
      ? getGenerationSpeedTierProfile(generationSpeedTier)
      : undefined;
    const mode = speedProfile?.swaprMode ?? requestedMode;
    const characterOrientation =
      speedProfile?.swaprCharacterOrientation ?? requestedCharacterOrientation;
    const keepOriginalSound = getSwaprFormBoolean(
      formData,
      "keepOriginalSound",
    );

    await convex.mutation(api.rateLimits.consumeSwaprJobCreate, {
      estimatedSeconds: getSwaprReferenceDurationLimit(characterOrientation),
      secret,
    });

    const replicate = createReplicateClient();
    const prediction = await replicate.predictions.create({
      model: SWAPR_MODEL_ID,
      input: {
        image,
        video,
        prompt,
        mode,
        keep_original_sound: keepOriginalSound,
        character_orientation: characterOrientation,
      },
    });
    const now = new Date().toISOString();

    await convex.mutation(api.replicateJobs.recordSwaprJob, {
      secret,
      predictionId: prediction.id,
      modelId: SWAPR_MODEL_ID,
      status: getReplicatePredictionStatus(prediction.status),
      createdAt: now,
      updatedAt: now,
    });

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "swapr_job_created",
      properties: {
        prediction_id: prediction.id,
        mode,
        character_orientation: characterOrientation,
        generation_speed_tier: generationSpeedTier,
        keep_original_sound: keepOriginalSound,
      },
      request,
    });

    return NextResponse.json(
      createSwaprPredictionJson(prediction, {
        characterOrientation,
        generationSpeedTier,
        mode,
      }),
    );
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
            : "Unable to create Swapr prediction.",
      },
      { status: 500 },
    );
  }
}
