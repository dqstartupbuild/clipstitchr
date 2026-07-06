import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { filterPostBridgePostsByMappedPostIds } from "@/lib/clipstitchr/server/postBridge/filterPostBridgePostsByMappedPostIds";
import { listPostBridgePosts } from "@/lib/clipstitchr/server/postBridge/listPostBridgePosts";
import { readPostBridgeProductIdFromRequest } from "@/lib/clipstitchr/server/postBridge/readPostBridgeProductIdFromRequest";
import { resolvePostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey";
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

    await convex.mutation(api.rateLimits.consumePostBridgeRead, {
      secret: getRateLimitApiSecret(),
    });

    const apiKey = await resolvePostBridgeApiKey(convex);
    const productId = readPostBridgeProductIdFromRequest(request);
    const mappedPostIds = productId
      ? await convex.query(
          api.postBridgePostProductMappings.listPostIdsByProduct,
          {
            productId,
          },
        )
      : null;
    const posts = await listPostBridgePosts(apiKey);

    return Response.json({
      posts: mappedPostIds
        ? filterPostBridgePostsByMappedPostIds(posts, mappedPostIds)
        : posts,
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
            : "Unable to load scheduled posts.",
      },
      { status: 400 },
    );
  }
}
