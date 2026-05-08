import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { readR2DownloadUrlRequest } from "@/lib/clipstitchr/server/r2/readR2DownloadUrlRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const { key } = await readR2DownloadUrlRequest(request);

    assertR2ObjectKeyBelongsToUser(key, userId);

    const signedUrl = await getR2DownloadSignedUrl(key);

    return Response.json({
      url: signedUrl.url,
      expiresIn: signedUrl.expiresIn,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create an R2 download URL.",
      },
      { status: 400 },
    );
  }
}
