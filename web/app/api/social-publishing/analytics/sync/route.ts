import { api } from "@/convex/_generated/api";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createEmptySocialPublishingAnalyticsLoadResult } from "@/lib/clipstitchr/server/socialPublishing/createEmptySocialPublishingAnalyticsLoadResult";
import { getSocialPublishingAnalyticsAccountIds } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAnalyticsAccountIds";
import { listSocialPublishingAnalyticsAccounts } from "@/lib/clipstitchr/server/socialPublishing/listSocialPublishingAnalyticsAccounts";
import { loadSocialPublishingAnalyticsDashboard } from "@/lib/clipstitchr/server/socialPublishing/loadSocialPublishingAnalyticsDashboard";
import { readSocialPublishingProductIdFromRequest } from "@/lib/clipstitchr/server/socialPublishing/readSocialPublishingProductIdFromRequest";
import { resolveSocialPublishingApiKey } from "@/lib/clipstitchr/server/socialPublishing/resolveSocialPublishingApiKey";
import { syncSocialPublishingExternalPosts } from "@/lib/clipstitchr/server/socialPublishing/syncSocialPublishingExternalPosts";

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

    await convex.mutation(api.rateLimits.consumeSocialPublishingAnalyticsSync, {
      secret: getRateLimitApiSecret(),
    });

    const productId = readSocialPublishingProductIdFromRequest(request);
    const product = productId
      ? await convex.query(api.products.get, { id: productId })
      : null;
    const apiKey = await resolveSocialPublishingApiKey(convex);
    const accounts = await listSocialPublishingAnalyticsAccounts(apiKey);
    const accountIds = getSocialPublishingAnalyticsAccountIds(
      accounts,
      productId ? product?.socialPublishingSocialAccountIds ?? [] : undefined,
    );

    if (!accountIds.length) {
      return Response.json(createEmptySocialPublishingAnalyticsLoadResult());
    }

    const externalSyncFailedAccountCount =
      await syncSocialPublishingExternalPosts(apiKey, accountIds);
    const dashboard = await loadSocialPublishingAnalyticsDashboard({
      accountIds,
      accounts,
      apiKey,
      externalSyncFailedAccountCount,
    });

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "social_publishing_analytics_refreshed",
      properties: { provider: "zernio" },
      request,
    });

    return Response.json(dashboard);
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
            : "Unable to refresh post analytics.",
      },
      { status: 400 },
    );
  }
}
