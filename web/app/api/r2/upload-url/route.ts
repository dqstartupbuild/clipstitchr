import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
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
