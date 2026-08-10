import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { listSocialPublishingSocialAccounts } from "@/lib/clipstitchr/server/socialPublishing/listSocialPublishingSocialAccounts";
import { resolveSocialPublishingApiKey } from "@/lib/clipstitchr/server/socialPublishing/resolveSocialPublishingApiKey";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

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

    const productId =
      new URL(request.url).searchParams.get("productId")?.trim() || undefined;
    const product = productId
      ? await convex.query(api.products.get, { id: productId })
      : null;
    const apiKey = await resolveSocialPublishingApiKey(convex);

    return Response.json({
      accounts: await listSocialPublishingSocialAccounts(apiKey),
      defaultSocialAccountIds: product?.socialPublishingSocialAccountIds ?? [],
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
            : "Unable to load connected accounts.",
      },
      { status: 400 },
    );
  }
}
