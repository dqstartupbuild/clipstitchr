import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { assertPostBridgeSourceMediaKind } from "@/lib/clipstitchr/server/postBridge/assertPostBridgeSourceMediaKind";
import { readPostBridgeMediaUploadRequest } from "@/lib/clipstitchr/server/postBridge/readPostBridgeMediaUploadRequest";
import { resolvePostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey";
import { uploadPostBridgeMediaFromR2Object } from "@/lib/clipstitchr/server/postBridge/uploadPostBridgeMediaFromR2Object";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const input = await readPostBridgeMediaUploadRequest(request);
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

    const media = await uploadPostBridgeMediaFromR2Object({
      apiKey: await resolvePostBridgeApiKey(convex),
      media: input.media,
      sourceObject: input.sourceObject,
      userId,
    });

    return Response.json({ media });
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
            : "Unable to upload this media to Post Bridge.",
      },
      { status: 400 },
    );
  }
}
