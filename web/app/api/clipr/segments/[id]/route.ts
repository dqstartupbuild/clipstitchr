import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
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
