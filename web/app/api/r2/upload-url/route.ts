import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { getR2UploadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2UploadSignedUrl";
import { readR2UploadUrlRequest } from "@/lib/clipstitchr/server/r2/readR2UploadUrlRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const body = await readR2UploadUrlRequest(request);
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await convex.mutation(api.rateLimits.consumeR2Upload, {
      secret: getRateLimitApiSecret(),
      sizeBytes: body.sizeBytes,
    });

    const key = createR2ObjectKey({
      userId,
      kind: body.kind,
      recordId: body.recordId,
      contentType: body.contentType,
    });
    const signedUrl = await getR2UploadSignedUrl({
      key,
      contentType: body.contentType,
    });

    return Response.json({
      key,
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
            : "Unable to create an R2 upload URL.",
      },
      { status: 400 },
    );
  }
}
