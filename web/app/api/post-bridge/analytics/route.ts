import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { filterPostBridgeAnalyticsByPostResultIds } from "@/lib/clipstitchr/server/postBridge/filterPostBridgeAnalyticsByPostResultIds";
import { createPostBridgeAnalyticsResponse } from "@/lib/clipstitchr/server/postBridge/createPostBridgeAnalyticsResponse";
import { getPostBridgeAnalyticsIsStale } from "@/lib/clipstitchr/server/postBridge/getPostBridgeAnalyticsIsStale";
import { listPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/listPostBridgeAnalytics";
import { listPostBridgePostResults } from "@/lib/clipstitchr/server/postBridge/listPostBridgePostResults";
import { readPostBridgeProductIdFromRequest } from "@/lib/clipstitchr/server/postBridge/readPostBridgeProductIdFromRequest";
import { resolvePostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey";
import { waitForPostBridgeAnalyticsSync } from "@/lib/clipstitchr/server/postBridge/waitForPostBridgeAnalyticsSync";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { isRateLimitExceededError } from "@/lib/clipstitchr/server/rateLimits/isRateLimitExceededError";

export const runtime = "nodejs";

export async function GET(request: Request) {
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
    const productId = readPostBridgeProductIdFromRequest(request);
    const mappedPostIds = productId
      ? await convex.query(
          api.postBridgePostProductMappings.listPostIdsByProduct,
          {
            productId,
          },
        )
      : null;

    if (mappedPostIds && mappedPostIds.length === 0) {
      return createPostBridgeAnalyticsResponse([], false, false);
    }

    const postResults = mappedPostIds
      ? await listPostBridgePostResults(apiKey, mappedPostIds)
      : null;
    const postResultIds = postResults?.map((postResult) => postResult.id);

    if (postResultIds && postResultIds.length === 0) {
      return createPostBridgeAnalyticsResponse([], false, false);
    }

    const loadAnalytics = async () => {
      const analytics = await listPostBridgeAnalytics(
        apiKey,
        postResultIds ?? [],
      );

      return postResultIds
        ? filterPostBridgeAnalyticsByPostResultIds(analytics, postResultIds)
        : analytics;
    };

    const analytics = await loadAnalytics();
    const hasPostResults = postResultIds
      ? postResultIds.length > 0
      : analytics.length > 0;
    const stale = getPostBridgeAnalyticsIsStale(analytics, hasPostResults);
    const readOnly = new URL(request.url).searchParams.get("readOnly") === "1";

    if (!stale || readOnly) {
      return createPostBridgeAnalyticsResponse(analytics, false, false);
    }

    let syncTriggered = false;

    try {
      await convex.mutation(api.rateLimits.consumePostBridgeAnalyticsSync, {
        secret: getRateLimitApiSecret(),
      });
      syncTriggered = true;
    } catch (syncRateLimitError) {
      if (!isRateLimitExceededError(syncRateLimitError)) {
        throw syncRateLimitError;
      }
    }

    if (!syncTriggered) {
      return createPostBridgeAnalyticsResponse(analytics, false, true);
    }

    await waitForPostBridgeAnalyticsSync(apiKey, postResultIds ?? []);

    const syncedAnalytics = await loadAnalytics();

    return createPostBridgeAnalyticsResponse(
      syncedAnalytics,
      true,
      getPostBridgeAnalyticsIsStale(syncedAnalytics, hasPostResults),
    );
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
