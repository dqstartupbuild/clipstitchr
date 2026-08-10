import { api } from "@/convex/_generated/api";
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

    await convex.mutation(api.rateLimits.consumeSocialPublishingRead, {
      secret: getRateLimitApiSecret(),
    });

    const productId = readSocialPublishingProductIdFromRequest(request);
    const mappedPostIds = productId
      ? await convex.query(
          api.socialPublishingPostProductMappings.listPostIdsByProduct,
          { productId },
        )
      : [];

    if (productId && mappedPostIds.length === 0) {
      return Response.json({
        analytics: [],
        lastSyncedAt: null,
        stale: false,
      });
    }

    const analytics = await listSocialPublishingAnalytics(
      await resolveSocialPublishingApiKey(convex),
      mappedPostIds,
    );
    const freshness = getSocialPublishingAnalyticsFreshness(analytics);

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
            : "Unable to load post analytics.",
      },
      { status: 400 },
    );
  }
}
