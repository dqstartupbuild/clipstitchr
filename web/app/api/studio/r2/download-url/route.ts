import { api } from "@/convex/_generated/api";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createStudioBetaApiAccessErrorResponse } from "@/lib/clipstitchr/server/studio/access/createStudioBetaApiAccessErrorResponse";
import { assertStudioBetaR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/studio/r2/assertStudioBetaR2ObjectKeyBelongsToUser";
import { assertStudioBetaR2ObjectKeyBelongsToProduct } from "@/lib/clipstitchr/server/studio/r2/assertStudioBetaR2ObjectKeyBelongsToProduct";
import { createStudioBetaR2JsonResponse } from "@/lib/clipstitchr/server/studio/r2/createStudioBetaR2JsonResponse";
import { getStudioBetaR2PublicErrorMessage } from "@/lib/clipstitchr/server/studio/r2/getStudioBetaR2PublicErrorMessage";
import { readStudioBetaR2DownloadUrlRequest } from "@/lib/clipstitchr/server/studio/r2/readStudioBetaR2DownloadUrlRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId } = await assertStudioBetaApiAccess();
    const { key, productId } = await readStudioBetaR2DownloadUrlRequest(request);

    assertStudioBetaR2ObjectKeyBelongsToUser(key, userId);
    assertStudioBetaR2ObjectKeyBelongsToProduct(key, userId, productId);

    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to verify this download.");
    }

    await createAuthenticatedConvexHttpClient(convexToken).mutation(
      api.studioBetaRateLimits.consumeStudioBetaR2Download
        .consumeStudioBetaR2Download,
      { productId, secret: getRateLimitApiSecret() },
    );

    const signedUrl = await getR2DownloadSignedUrl(key);

    return createStudioBetaR2JsonResponse({
      expiresIn: signedUrl.expiresIn,
      url: signedUrl.url,
    });
  } catch (error) {
    const accessErrorResponse = createStudioBetaApiAccessErrorResponse(error);

    if (accessErrorResponse) {
      return accessErrorResponse;
    }

    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return createStudioBetaR2JsonResponse(
      {
        error: getStudioBetaR2PublicErrorMessage(
          error,
          "Unable to create this Studio download.",
        ),
      },
      400,
    );
  }
}
