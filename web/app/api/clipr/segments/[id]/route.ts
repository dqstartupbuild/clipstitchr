import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createCliprSeedanceFallbackInput } from "@/lib/clipstitchr/server/createCliprSeedanceFallbackInput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getCliprSeedanceErrorIsSensitive } from "@/lib/clipstitchr/server/getCliprSeedanceErrorIsSensitive";
import { getReplicatePredictionStatus } from "@/lib/clipstitchr/server/getReplicatePredictionStatus";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getSwaprPredictionOutputUrl } from "@/lib/clipstitchr/utils/getSwaprPredictionOutputUrl";

export const runtime = "nodejs";

type CliprSegmentRouteContext = {
  params: Promise<{ id: string }>;
};

function getPredictionError(error: unknown) {
  return typeof error === "string"
    ? error
    : error
      ? JSON.stringify(error)
      : undefined;
}

export async function GET(
  _request: Request,
  { params }: CliprSegmentRouteContext,
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const { id } = await params;
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeCliprSegmentPoll, {
      secret,
      predictionId: id,
    });

    const replicate = createReplicateClient();
    const prediction = await replicate.predictions.get(id);
    const outputUrl = getSwaprPredictionOutputUrl(prediction.output);
    const status = getReplicatePredictionStatus(prediction.status);

    await convex.mutation(api.replicateJobs.updateCliprVideoJobStatus, {
      secret,
      predictionId: prediction.id,
      status,
      outputUrl: outputUrl ?? undefined,
      error: getPredictionError(prediction.error),
      updatedAt: new Date().toISOString(),
    });

    const fallbackInput =
      status === "failed" && getCliprSeedanceErrorIsSensitive(prediction.error)
        ? createCliprSeedanceFallbackInput(prediction.input)
        : null;

    if (fallbackInput) {
      await convex.mutation(api.rateLimits.consumeCliprSegmentGenerate, {
        estimatedSeconds:
          typeof fallbackInput.duration === "number" ? fallbackInput.duration : 15,
        secret,
      });

      const fallbackPrediction = await replicate.predictions.create({
        model: prediction.model,
        input: fallbackInput,
      });
      const fallbackCreatedAt = new Date().toISOString();
      const fallbackStatus = getReplicatePredictionStatus(
        fallbackPrediction.status,
      );
      const fallbackOutputUrl =
        fallbackPrediction.status === "succeeded"
          ? getSwaprPredictionOutputUrl(fallbackPrediction.output)
          : undefined;

      await convex.mutation(api.replicateJobs.recordCliprVideoJob, {
        secret,
        predictionId: fallbackPrediction.id,
        modelId: prediction.model,
        status: fallbackStatus,
        createdAt: fallbackCreatedAt,
        updatedAt: fallbackCreatedAt,
      });

      if (fallbackOutputUrl) {
        await convex.mutation(api.replicateJobs.updateCliprVideoJobStatus, {
          secret,
          predictionId: fallbackPrediction.id,
          status: fallbackStatus,
          outputUrl: fallbackOutputUrl,
          error: getPredictionError(fallbackPrediction.error),
          updatedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        videoPredictionId: fallbackPrediction.id,
        status: fallbackStatus,
        videoUrl: fallbackOutputUrl ?? undefined,
        fallbackReason:
          "Seedance flagged the audio-reference attempt, so Clipr retried with Seedance-native audio.",
        logs: fallbackPrediction.logs,
        urls: {
          get: fallbackPrediction.urls.get,
          web: fallbackPrediction.urls.web,
          cancel: fallbackPrediction.urls.cancel,
        },
      });
    }

    return NextResponse.json({
      videoPredictionId: prediction.id,
      status,
      videoUrl: outputUrl ?? undefined,
      error: prediction.error,
      logs: prediction.logs,
      urls: {
        get: prediction.urls.get,
        web: prediction.urls.web,
        cancel: prediction.urls.cancel,
      },
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
            : "Unable to load Clipr segment.",
      },
      { status: 500 },
    );
  }
}
