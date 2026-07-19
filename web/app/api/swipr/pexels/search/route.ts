import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getPexelsSearchPage } from "@/lib/clipstitchr/server/pexels/getPexelsSearchPage";
import { getPexelsSearchPerPage } from "@/lib/clipstitchr/server/pexels/getPexelsSearchPerPage";
import { getPexelsSearchQuery } from "@/lib/clipstitchr/server/pexels/getPexelsSearchQuery";
import { searchPexelsPhotoResults } from "@/lib/clipstitchr/server/pexels/searchPexelsPhotoResults";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

type PexelsSearchRequest = {
  page?: unknown;
  perPage?: unknown;
  query?: unknown;
};

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const body = (await request.json()) as PexelsSearchRequest;
    const query = getPexelsSearchQuery(body.query);
    const page = getPexelsSearchPage(body.page);
    const perPage = getPexelsSearchPerPage(body.perPage);
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await convex.mutation(api.rateLimits.consumePexelsSearch, {
      secret: getRateLimitApiSecret(),
    });

    const photos = await searchPexelsPhotoResults({ page, perPage, query });
    const existingPhotoIds = new Set(
      await convex.query(api.swiprBackgrounds.getExistingPexelsPhotoIds, {
        photoIds: photos.map((photo) => photo.id),
      }),
    );

    return Response.json({
      hasMore: photos.length === perPage,
      page,
      perPage,
      photos: photos.filter((photo) => !existingPhotoIds.has(photo.id)),
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to search Pexels.",
      },
      { status: 400 },
    );
  }
}
