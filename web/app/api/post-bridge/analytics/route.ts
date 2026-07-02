import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { listPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/listPostBridgeAnalytics";
import { resolvePostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { sortContentAnalyticsByCreatedAt } from "@/lib/clipstitchr/utils/sortContentAnalyticsByCreatedAt";
import { toContentAnalyticsFromPostBridgeAnalytics } from "@/lib/clipstitchr/utils/toContentAnalyticsFromPostBridgeAnalytics";

export const runtime = "nodejs";

export async function GET() {
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

    await convex.mutation(api.rateLimits.consumePostBridgeRead, {
      secret: getRateLimitApiSecret(),
    });

    const apiKey = await resolvePostBridgeApiKey(convex);
    const analytics = await listPostBridgeAnalytics(apiKey);

    return Response.json({
      analytics: sortContentAnalyticsByCreatedAt(
        analytics.map(toContentAnalyticsFromPostBridgeAnalytics),
      ),
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load post analytics.",
      },
      { status: 400 },
    );
  }
}
