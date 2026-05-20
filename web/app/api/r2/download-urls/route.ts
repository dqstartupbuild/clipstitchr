import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { assertR2DownloadUrlsKeyIsCacheableImage } from "@/lib/clipstitchr/server/r2/assertR2DownloadUrlsKeyIsCacheableImage";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { readR2DownloadUrlsRequest } from "@/lib/clipstitchr/server/r2/readR2DownloadUrlsRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const { keys } = await readR2DownloadUrlsRequest(request);
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    for (const key of keys) {
      assertR2ObjectKeyBelongsToUser(key, userId);
      assertR2DownloadUrlsKeyIsCacheableImage(key);
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await convex.mutation(api.rateLimits.consumeR2Download, {
      secret: getRateLimitApiSecret(),
    });

    const signedUrls = await Promise.all(
      keys.map(async (key) => {
        const signedUrl = await getR2DownloadSignedUrl(key);

        return {
          expiresIn: signedUrl.expiresIn,
          key,
          url: signedUrl.url,
        };
      }),
    );

    return Response.json({
      urls: signedUrls,
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
            : "Unable to create R2 download URLs.",
      },
      { status: 400 },
    );
  }
}
