import { api } from "@/convex/_generated/api";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { syncManualContentAnalyticsForAccounts } from "@/lib/clipstitchr/server/apify/syncManualContentAnalyticsForAccounts";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { listPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/listPostBridgeAnalytics";
import { listPostBridgeSocialAccounts } from "@/lib/clipstitchr/server/postBridge/listPostBridgeSocialAccounts";
import { resolvePostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey";
import { syncPostBridgeAnalytics } from "@/lib/clipstitchr/server/postBridge/syncPostBridgeAnalytics";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import type { ManualContentAnalyticsSyncResult } from "@/lib/clipstitchr/types/ManualContentAnalyticsSyncResult";
import { sortContentAnalyticsByCreatedAt } from "@/lib/clipstitchr/utils/sortContentAnalyticsByCreatedAt";
import { toContentAnalyticsFromPostBridgeAnalytics } from "@/lib/clipstitchr/utils/toContentAnalyticsFromPostBridgeAnalytics";

export const runtime = "nodejs";

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

    await convex.mutation(api.rateLimits.consumePostBridgeAnalyticsSync, {
      secret: getRateLimitApiSecret(),
    });
    const apiKey = await resolvePostBridgeApiKey(convex);

    await syncPostBridgeAnalytics(apiKey);

    const postBridgeAnalytics = await listPostBridgeAnalytics(apiKey);
    let manualAnalyticsSync: ManualContentAnalyticsSyncResult = {
      analytics: [],
      failedAccountCount: 0,
      skippedItemCount: 0,
      warning: null,
    };

    try {
      const accounts = await listPostBridgeSocialAccounts(apiKey);

      manualAnalyticsSync = await syncManualContentAnalyticsForAccounts({
        accounts,
        postBridgeAnalytics,
      });
    } catch {
      manualAnalyticsSync = {
        analytics: [],
        failedAccountCount: 0,
        skippedItemCount: 0,
        warning:
          "Manual analytics could not sync right now. Your Post Bridge results are still here, and you can try again.",
      };
    }

    const postBridgeContentAnalytics = postBridgeAnalytics.map(
      toContentAnalyticsFromPostBridgeAnalytics,
    );
    const analytics = sortContentAnalyticsByCreatedAt([
      ...postBridgeContentAnalytics,
      ...manualAnalyticsSync.analytics,
    ]);

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "post_bridge_analytics_synced",
      properties: {
        manualAnalyticsCount: manualAnalyticsSync.analytics.length,
        manualAnalyticsFailedAccountCount:
          manualAnalyticsSync.failedAccountCount,
        manualAnalyticsSkippedItemCount: manualAnalyticsSync.skippedItemCount,
        manualAnalyticsWarning: Boolean(manualAnalyticsSync.warning),
        postBridgeAnalyticsCount: postBridgeContentAnalytics.length,
      },
      request,
    });

    return Response.json({
      analytics,
      manualAnalyticsFailedAccountCount:
        manualAnalyticsSync.failedAccountCount,
      manualAnalyticsSkippedItemCount: manualAnalyticsSync.skippedItemCount,
      manualAnalyticsWarning: manualAnalyticsSync.warning,
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
            : "Unable to sync post analytics.",
      },
      { status: 400 },
    );
  }
}
