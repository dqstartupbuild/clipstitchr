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
import { getSwaprPredictionOutputUrl } from "@/lib/clipstitchr/utils/getSwaprPredictionOutputUrl";

export const runtime = "nodejs";

type SwaprJobRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: SwaprJobRouteContext,
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

    await convex.mutation(api.rateLimits.consumeSwaprJobPoll, {
      secret,
      predictionId: id,
    });

    const replicate = createReplicateClient();
    const prediction = await replicate.predictions.get(id);
    const outputUrl = getSwaprPredictionOutputUrl(prediction.output);

    await convex.mutation(api.replicateJobs.updateSwaprJobStatus, {
      secret,
      predictionId: prediction.id,
      status: getReplicatePredictionStatus(prediction.status),
      outputUrl: outputUrl ?? undefined,
      error:
        typeof prediction.error === "string" ? prediction.error : undefined,
      updatedAt: new Date().toISOString(),
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
            : "Unable to load Swapr prediction.",
      },
      { status: 500 },
    );
  }
}
