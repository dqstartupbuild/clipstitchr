import { randomUUID } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { dispatchSocialProviderWorkerFromApi } from "@/lib/clipstitchr/server/social/dispatchSocialProviderWorkerFromApi";
import { readSocialAnalyticsRefreshRequest } from "@/lib/clipstitchr/server/social/readSocialAnalyticsRefreshRequest";
import { assertInHouseSocialPublishingEnabled } from "@/lib/clipstitchr/social/assertInHouseSocialPublishingEnabled";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    assertInHouseSocialPublishingEnabled();

    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to refresh analytics.");
    }

    const input = await readSocialAnalyticsRefreshRequest(request);
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const result = await convex.mutation(
      api.socialAnalytics.createSocialAnalyticsRefreshRun
        .createSocialAnalyticsRefreshRun,
      {
        id: `social-analytics:${randomUUID()}`,
        now: new Date().toISOString(),
        ...input,
      },
    );
    const dispatchStatus = await dispatchSocialProviderWorkerFromApi(convex);

    return Response.json({ ...result, dispatchStatus }, { status: 202 });
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
            : "Unable to refresh analytics.",
      },
      { status: 400 },
    );
  }
}
