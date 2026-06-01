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
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { readSwaprJobCreateRequest } from "@/lib/clipstitchr/server/readSwaprJobCreateRequest";
import { SWAPR_MAX_REFERENCE_DURATION_SECONDS } from "@/lib/clipstitchr/constants/swaprMaxReferenceDurationSeconds";
import { SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES } from "@/lib/clipstitchr/constants/swaprReferenceVideoMaxSizeBytes";
import { getGenerationSpeedTierProfile } from "@/lib/clipstitchr/utils/getGenerationSpeedTierProfile";
import { getSwaprSegmentDurationLimit } from "@/lib/clipstitchr/utils/getSwaprSegmentDurationLimit";
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
    const body = await readSwaprJobCreateRequest(request);
    const photoDocument = await convex.query(api.photoAssets.get, {
      id: body.photoId,
    });

    if (!photoDocument) {
      throw new Error("Saved Swapr photo not found.");
    }

    assertR2ObjectKeyBelongsToUser(photoDocument.photoObject.key, userId);
    assertR2ObjectKeyBelongsToUser(body.videoObject.key, userId);

    if (!photoDocument.photoObject.contentType.startsWith("image/")) {
      throw new Error("Swapr photo object must be an image.");
    }

    if (!body.videoObject.contentType.startsWith("video/")) {
      throw new Error("Swapr reference object must be a video.");
    }

    if (body.videoObject.size > SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES) {
      throw new Error("Choose a smaller source video for Swapr.");
    }

    const generationSpeedTier = body.generationSpeedTier;
    const speedProfile = generationSpeedTier
      ? getGenerationSpeedTierProfile(generationSpeedTier)
      : undefined;
    const mode = speedProfile?.swaprMode ?? body.mode;
    const characterOrientation =
      speedProfile?.swaprCharacterOrientation ?? body.characterOrientation;
    const segmentDurationLimit = getSwaprSegmentDurationLimit(
      characterOrientation,
    );

    if (body.estimatedDurationSeconds > segmentDurationLimit + 0.25) {
      throw new Error("Swapr reference segment is too long.");
    }

    if (
      body.totalEstimatedDurationSeconds >
      SWAPR_MAX_REFERENCE_DURATION_SECONDS + 0.25
    ) {
      throw new Error("Swapr reference video is too long.");
    }

    if (
      body.totalSegmentCount >
      Math.ceil(body.totalEstimatedDurationSeconds / segmentDurationLimit)
    ) {
      throw new Error("Swapr batch has too many segments.");
    }

    await convex.mutation(api.rateLimits.consumeSwaprJobCreate, {
      estimatedSeconds:
        body.segmentIndex === 0
          ? body.totalEstimatedDurationSeconds
          : body.estimatedDurationSeconds,
      secret,
      shouldConsumeUserQuota: body.segmentIndex === 0,
    });
    await Promise.all([
      convex.mutation(api.rateLimits.consumeR2Download, { secret }),
      convex.mutation(api.rateLimits.consumeR2Download, { secret }),
    ]);

    const [image, video] = await Promise.all([
      getR2DownloadSignedUrl(photoDocument.photoObject.key),
      getR2DownloadSignedUrl(body.videoObject.key),
    ]);

    const replicate = createReplicateClient();
    const prediction = await replicate.predictions.create({
      model: SWAPR_MODEL_ID,
      input: {
        image: image.url,
        video: video.url,
        prompt: body.prompt,
        mode,
        keep_original_sound: body.keepOriginalSound,
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
        batch_id: body.batchId,
        segment_index: body.segmentIndex,
        total_segment_count: body.totalSegmentCount,
        mode,
        character_orientation: characterOrientation,
        generation_speed_tier: generationSpeedTier,
        estimated_duration_seconds: body.estimatedDurationSeconds,
        keep_original_sound: body.keepOriginalSound,
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
