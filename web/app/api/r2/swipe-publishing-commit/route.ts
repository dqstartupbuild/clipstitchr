import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";
import { readSwipePublishingCommitRequest } from "@/lib/clipstitchr/server/r2/readSwipePublishingCommitRequest";
import { enrichPublishingMediaObjectWithR2Head } from "@/lib/clipstitchr/publishing/media/server/enrichPublishingMediaObjectWithR2Head";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ownerId = await getAuthenticatedUserId();

  if (!ownerId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const { attemptId } = await readSwipePublishingCommitRequest(request);
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const attempt = await convex.query(
      api.swipePublishingBundles.getAttempt.get,
      { attemptId },
    );

    if (!attempt) {
      throw new Error("Swipe publishing upload attempt not found.");
    }

    if (attempt.status === "committed") {
      return Response.json({ bundle: attempt.bundle });
    }

    await convex.mutation(api.rateLimits.consumeSwipePublishingPrepare, {
      secret: getRateLimitApiSecret(),
    });

    const environment = getR2Environment();
    const headClient = createR2Client();

    await Promise.all(
      attempt.bundle.slides.map((slide) => {
        const version = [
          ...(slide.versionId ? [`version:${slide.versionId}`] : []),
          ...(slide.etag ? [`etag:${slide.etag}`] : []),
        ].join("|");

        return enrichPublishingMediaObjectWithR2Head({
          bucketName: environment.bucketName,
          descriptor: { kind: "swipe", recordId: attempt.swipeId },
          headClient,
          mediaObject: {
            checksum: `sha256:${slide.checksumSha256}`,
            contentType: slide.object.contentType,
            height: slide.height,
            objectKey: slide.object.key,
            sizeBytes: slide.object.size,
            ...(version ? { version } : {}),
            width: slide.width,
          },
          ownerId,
        });
      }),
    );

    const bundle = await convex.mutation(
      api.swipePublishingBundles.commit.commit,
      {
        attemptId,
        secret: getRateLimitApiSecret(),
      },
    );

    return Response.json({ bundle });
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
            : "Unable to commit Swipe publishing media.",
      },
      { status: 400 },
    );
  }
}
