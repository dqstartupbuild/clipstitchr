import { api } from "@/convex/_generated/api";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getSocialPublishingAnalyticsFreshness } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAnalyticsFreshness";
import { listSocialPublishingAnalytics } from "@/lib/clipstitchr/server/socialPublishing/listSocialPublishingAnalytics";
import { readSocialPublishingProductIdFromRequest } from "@/lib/clipstitchr/server/socialPublishing/readSocialPublishingProductIdFromRequest";
import { resolveSocialPublishingApiKey } from "@/lib/clipstitchr/server/socialPublishing/resolveSocialPublishingApiKey";

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
    const mappedPostIds = productId
      ? await convex.query(
          api.socialPublishingPostProductMappings.listPostIdsByProduct,
          { productId },
        )
      : [];
    const analytics =
      productId && mappedPostIds.length === 0
        ? []
        : await listSocialPublishingAnalytics(
            await resolveSocialPublishingApiKey(convex),
            mappedPostIds,
          );
    const freshness = getSocialPublishingAnalyticsFreshness(analytics);

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "social_publishing_analytics_refreshed",
      properties: { provider: "zernio" },
      request,
    });

    return Response.json({
      analytics,
      ...freshness,
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
            : "Unable to refresh post analytics.",
      },
      { status: 400 },
    );
  }
}
