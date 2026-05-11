import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { readSwiprBackgroundDownloadUrlRequest } from "@/lib/clipstitchr/server/r2/readSwiprBackgroundDownloadUrlRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const { id } = await readSwiprBackgroundDownloadUrlRequest(request);
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const background = await convex.query(api.swiprBackgrounds.get, { id });

    if (!background) {
      throw new Error("Swipr background not found.");
    }

    await convex.mutation(api.rateLimits.consumeR2Download, {
      secret: getRateLimitApiSecret(),
    });

    const signedUrl = await getR2DownloadSignedUrl(background.imageObject.key);

    return Response.json({
      url: signedUrl.url,
      expiresIn: signedUrl.expiresIn,
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
            : "Unable to create a Swipr background download URL.",
      },
      { status: 400 },
    );
  }
}
