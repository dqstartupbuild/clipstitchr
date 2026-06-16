import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getPexelsApiKey } from "@/lib/clipstitchr/server/pexels/getPexelsApiKey";
import { getPexelsSearchPerPage } from "@/lib/clipstitchr/server/pexels/getPexelsSearchPerPage";
import { getPexelsSearchQuery } from "@/lib/clipstitchr/server/pexels/getPexelsSearchQuery";
import { parsePexelsSearchResponse } from "@/lib/clipstitchr/server/pexels/parsePexelsSearchResponse";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

type PexelsSearchRequest = {
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
    const perPage = getPexelsSearchPerPage(body.perPage);
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await convex.mutation(api.rateLimits.consumePexelsSearch, {
      secret: getRateLimitApiSecret(),
    });

    const url = new URL("https://api.pexels.com/v1/search");

    url.searchParams.set("query", query);
    url.searchParams.set("orientation", "portrait");
    url.searchParams.set("per_page", String(perPage));

    const response = await fetch(url, {
      headers: {
        Authorization: getPexelsApiKey(),
      },
    });

    if (!response.ok) {
      throw new Error("Unable to search Pexels right now.");
    }

    return Response.json({
      photos: parsePexelsSearchResponse(await response.json()),
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
