import { api } from "@/convex/_generated/api";
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

    return Response.json(
      await loadSocialPublishingAnalyticsDashboard({
        accountIds,
        accounts,
        apiKey,
      }),
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
