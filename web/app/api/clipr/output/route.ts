import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const predictionId = request.nextUrl.searchParams.get("id");
    const outputUrl = request.nextUrl.searchParams.get("url");
    const convexToken = await getAuthenticatedConvexToken();

    if (!predictionId) {
      throw new Error("Missing Clipr prediction ID.");
    }

    if (!outputUrl) {
      throw new Error("Missing Clipr output URL.");
    }

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await convex.mutation(api.rateLimits.consumeCliprOutputDownload, {
      secret: getRateLimitApiSecret(),
      predictionId,
      outputUrl,
    });

    const response = await fetchReplicateOutput(outputUrl);
    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    if (contentLength) {
      responseHeaders.set("content-length", contentLength);
    }

    return new NextResponse(response.body, { headers: responseHeaders });
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
            : "Unable to download Clipr output.",
      },
      { status: 500 },
    );
  }
}
