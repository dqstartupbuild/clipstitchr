import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { assertPostBridgeSourceMediaKind } from "@/lib/clipstitchr/server/postBridge/assertPostBridgeSourceMediaKind";
import { createPostBridgeUploadedMedia } from "@/lib/clipstitchr/server/postBridge/createPostBridgeUploadedMedia";
import { createPostBridgeUploadUrl } from "@/lib/clipstitchr/server/postBridge/createPostBridgeUploadUrl";
import { readPostBridgeMediaUploadUrlRequest } from "@/lib/clipstitchr/server/postBridge/readPostBridgeMediaUploadUrlRequest";
import { resolvePostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const input = await readPostBridgeMediaUploadUrlRequest(request);
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const source =
      input.sourceType === "stitch"
        ? await convex.query(api.stitches.get, { id: input.sourceId })
        : await convex.query(api.swipes.get, { id: input.sourceId });

    if (!source) {
      throw new Error("That saved post was not found.");
    }

    assertPostBridgeSourceMediaKind(input.sourceType, input.media.mediaKind);

    await convex.mutation(api.rateLimits.consumePostBridgeMediaUpload, {
      mediaSizeBytes: input.media.sizeBytes,
      secret: getRateLimitApiSecret(),
    });

    const apiKey = await resolvePostBridgeApiKey(convex);
    const upload = await createPostBridgeUploadUrl({
      apiKey,
      mimeType: input.media.mimeType,
      name: input.media.name,
      sizeBytes: input.media.sizeBytes,
    });
    const media = createPostBridgeUploadedMedia({
      mediaId: upload.media_id,
      mimeType: input.media.mimeType,
      name: upload.name || input.media.name,
      sizeBytes: input.media.sizeBytes,
    });

    return Response.json({
      media,
      uploadUrl: upload.upload_url,
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
            : "Unable to prepare this media upload.",
      },
      { status: 400 },
    );
  }
}
