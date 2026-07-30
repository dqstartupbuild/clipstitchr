import { api } from "@/convex/_generated/api";
import { postBridgeAnalyticsStaleThresholdMs } from "@/lib/clipstitchr/constants/postBridgeAnalyticsStaleThresholdMs";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { filterPostBridgeAnalyticsByPostResultIds } from "@/lib/clipstitchr/server/postBridge/filterPostBridgeAnalyticsByPostResultIds";
import { getLatestPostBridgeAnalyticsSyncedAtMs } from "@/lib/clipstitchr/server/postBridge/getLatestPostBridgeAnalyticsSyncedAtMs";
import { getPostBridgeLegacyWriteResponse } from "@/lib/clipstitchr/server/postBridge/getPostBridgeLegacyWriteResponse";
import { listPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/listPostBridgeAnalytics";
import { listPostBridgePostResults } from "@/lib/clipstitchr/server/postBridge/listPostBridgePostResults";
import { readPostBridgeProductIdFromRequest } from "@/lib/clipstitchr/server/postBridge/readPostBridgeProductIdFromRequest";
import { resolvePostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey";
import { waitForPostBridgeAnalyticsSync } from "@/lib/clipstitchr/server/postBridge/waitForPostBridgeAnalyticsSync";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export const runtime = "nodejs";

function createAnalyticsResponse(analytics: PostBridgeAnalytics[]) {
  const lastSyncedAtMs = getLatestPostBridgeAnalyticsSyncedAtMs(analytics);
  const stale =
    analytics.length > 0 &&
    (lastSyncedAtMs === null ||
      Date.now() - lastSyncedAtMs > postBridgeAnalyticsStaleThresholdMs);

  return Response.json({
    analytics,
    lastSyncedAt:
      lastSyncedAtMs === null ? null : new Date(lastSyncedAtMs).toISOString(),
    stale,
    syncTriggered: true,
  });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  const legacyWriteResponse = getPostBridgeLegacyWriteResponse();

  if (legacyWriteResponse) {
    return legacyWriteResponse;
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await convex.mutation(api.rateLimits.consumePostBridgeAnalyticsSync, {
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
      return createAnalyticsResponse([]);
    }

    const postResults = mappedPostIds
      ? await listPostBridgePostResults(apiKey, mappedPostIds)
      : null;
    const postResultIds = postResults?.map((postResult) => postResult.id);

    if (postResultIds && postResultIds.length === 0) {
      return createAnalyticsResponse([]);
    }

    await waitForPostBridgeAnalyticsSync(apiKey, postResultIds ?? []);
    await capturePostHogServerEvent({
      distinctId: userId,
      event: "post_bridge_analytics_synced",
      request,
    });

    const analytics = await listPostBridgeAnalytics(apiKey, postResultIds ?? []);

    return createAnalyticsResponse(
      postResultIds
        ? filterPostBridgeAnalyticsByPostResultIds(analytics, postResultIds)
        : analytics,
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
            : "Unable to sync post analytics.",
      },
      { status: 400 },
    );
  }
}
