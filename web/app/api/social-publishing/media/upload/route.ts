import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { assertSocialPublishingSourceMediaKind } from "@/lib/clipstitchr/server/socialPublishing/assertSocialPublishingSourceMediaKind";
import { readSocialPublishingMediaUploadRequest } from "@/lib/clipstitchr/server/socialPublishing/readSocialPublishingMediaUploadRequest";
import { resolveSocialPublishingApiKey } from "@/lib/clipstitchr/server/socialPublishing/resolveSocialPublishingApiKey";
import { uploadSocialPublishingMediaFromR2Object } from "@/lib/clipstitchr/server/socialPublishing/uploadSocialPublishingMediaFromR2Object";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const input = await readSocialPublishingMediaUploadRequest(request);
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

    assertSocialPublishingSourceMediaKind(input.sourceType, input.media.mediaKind);

    await convex.mutation(api.rateLimits.consumeSocialPublishingMediaUpload, {
      mediaSizeBytes: input.media.sizeBytes,
      secret: getRateLimitApiSecret(),
    });

    const media = await uploadSocialPublishingMediaFromR2Object({
      apiKey: await resolveSocialPublishingApiKey(convex),
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
            : "Unable to upload this media to Zernio.",
      },
      { status: 400 },
    );
  }
}
