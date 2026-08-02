import { api } from "@/convex/_generated/api";
import { postBridgeAnalyticsStaleThresholdMs } from "@/lib/clipstitchr/constants/postBridgeAnalyticsStaleThresholdMs";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { filterPostBridgeAnalyticsByPostResultIds } from "@/lib/clipstitchr/server/postBridge/filterPostBridgeAnalyticsByPostResultIds";
import { getLatestPostBridgeAnalyticsSyncedAtMs } from "@/lib/clipstitchr/server/postBridge/getLatestPostBridgeAnalyticsSyncedAtMs";
import { listPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/listPostBridgeAnalytics";
import { listPostBridgePostResults } from "@/lib/clipstitchr/server/postBridge/listPostBridgePostResults";
import { readPostBridgeProductIdFromRequest } from "@/lib/clipstitchr/server/postBridge/readPostBridgeProductIdFromRequest";
import { resolvePostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey";
import { waitForPostBridgeAnalyticsSync } from "@/lib/clipstitchr/server/postBridge/waitForPostBridgeAnalyticsSync";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { isRateLimitExceededError } from "@/lib/clipstitchr/server/rateLimits/isRateLimitExceededError";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export const runtime = "nodejs";

function readAnalyticsStale(
  analytics: PostBridgeAnalytics[],
  hasPostResults: boolean,
) {
  if (!hasPostResults) {
    return false;
  }

  const lastSyncedAtMs = getLatestPostBridgeAnalyticsSyncedAtMs(analytics);

  return (
    lastSyncedAtMs === null ||
    Date.now() - lastSyncedAtMs > postBridgeAnalyticsStaleThresholdMs
  );
}

function createAnalyticsResponse(
  analytics: PostBridgeAnalytics[],
  syncTriggered: boolean,
  stale: boolean,
) {
  const lastSyncedAtMs = getLatestPostBridgeAnalyticsSyncedAtMs(analytics);

  return Response.json({
    analytics,
    lastSyncedAt:
      lastSyncedAtMs === null ? null : new Date(lastSyncedAtMs).toISOString(),
    stale,
    syncTriggered,
  });
}

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
      return createAnalyticsResponse([], false, false);
    }

    const postResults = mappedPostIds
      ? await listPostBridgePostResults(apiKey, mappedPostIds)
      : null;
    const postResultIds = postResults?.map((postResult) => postResult.id);

    if (postResultIds && postResultIds.length === 0) {
      return createAnalyticsResponse([], false, false);
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
    const stale = readAnalyticsStale(analytics, hasPostResults);

    if (!stale) {
      return createAnalyticsResponse(analytics, false, false);
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
      return createAnalyticsResponse(analytics, false, true);
    }

    await waitForPostBridgeAnalyticsSync(apiKey, postResultIds ?? []);

    const syncedAnalytics = await loadAnalytics();

    return createAnalyticsResponse(
      syncedAnalytics,
      true,
      readAnalyticsStale(syncedAnalytics, hasPostResults),
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
