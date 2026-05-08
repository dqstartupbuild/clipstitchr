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

    await convex.mutation(api.rateLimits.consumeSwaprJobCreate, {
      secret,
    });

    const formData = await request.formData();
    const image = getSwaprFormFile(formData, "image");
    const video = getSwaprFormFile(formData, "video");
    const prompt = getSwaprFormString(formData, "prompt").trim();
    const mode = getSwaprMode(getSwaprFormString(formData, "mode"));
    const characterOrientation = getSwaprCharacterOrientation(
      getSwaprFormString(formData, "characterOrientation"),
    );
    const keepOriginalSound = getSwaprFormBoolean(
      formData,
      "keepOriginalSound",
    );

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

    return NextResponse.json(createSwaprPredictionJson(prediction));
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
