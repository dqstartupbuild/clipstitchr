import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { dispatchSocialProviderWorkerFromApi } from "@/lib/clipstitchr/server/social/dispatchSocialProviderWorkerFromApi";
import { assertInHouseSocialPublishingEnabled } from "@/lib/clipstitchr/social/assertInHouseSocialPublishingEnabled";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    assertInHouseSocialPublishingEnabled();

    const { id } = await context.params;
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to load TikTok posting choices.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const result = await convex.mutation(
      api.socialAccounts.requestTikTokCreatorInfoRefresh
        .requestTikTokCreatorInfoRefresh,
      {
        id,
        now: new Date().toISOString(),
      },
    );
    const dispatchStatus = result.queued
      ? await dispatchSocialProviderWorkerFromApi(convex)
      : "skipped";

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
            : "Unable to load TikTok posting choices.",
      },
      { status: 400 },
    );
  }
}
