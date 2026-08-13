import { api } from "@/convex/_generated/api";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getR2UploadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2UploadSignedUrl";
import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createStudioBetaApiAccessErrorResponse } from "@/lib/clipstitchr/server/studio/access/createStudioBetaApiAccessErrorResponse";
import { createStudioBetaR2ObjectKey } from "@/lib/clipstitchr/server/studio/r2/createStudioBetaR2ObjectKey";
import { createStudioBetaR2JsonResponse } from "@/lib/clipstitchr/server/studio/r2/createStudioBetaR2JsonResponse";
import { getStudioBetaR2PublicErrorMessage } from "@/lib/clipstitchr/server/studio/r2/getStudioBetaR2PublicErrorMessage";
import { readStudioBetaR2UploadUrlRequest } from "@/lib/clipstitchr/server/studio/r2/readStudioBetaR2UploadUrlRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId } = await assertStudioBetaApiAccess();
    const input = await readStudioBetaR2UploadUrlRequest(request);
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to verify this upload.");
    }

    await createAuthenticatedConvexHttpClient(convexToken).mutation(
      api.studioBetaRateLimits.consumeStudioBetaR2Upload
        .consumeStudioBetaR2Upload,
      {
        productId: input.productId,
        secret: getRateLimitApiSecret(),
        sizeBytes: input.sizeBytes,
      },
    );

    const key = createStudioBetaR2ObjectKey({ ...input, userId });
    const signedUrl = await getR2UploadSignedUrl({
      contentType: input.contentType,
      key,
      sizeBytes: input.sizeBytes,
    });

    return createStudioBetaR2JsonResponse({
      expiresIn: signedUrl.expiresIn,
      key,
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
          "Unable to create this Studio upload.",
        ),
      },
      400,
    );
  }
}
