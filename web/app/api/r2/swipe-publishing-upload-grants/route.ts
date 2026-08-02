import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createR2Client } from "@/lib/clipstitchr/server/r2/createR2Client";
import { getR2Environment } from "@/lib/clipstitchr/server/r2/getR2Environment";
import { getR2SignedUrlExpiresSeconds } from "@/lib/clipstitchr/server/r2/getR2SignedUrlExpiresSeconds";
import { getR2UploadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2UploadSignedUrl";
import { readSwipePublishingPreparationRequest } from "@/lib/clipstitchr/server/r2/readSwipePublishingPreparationRequest";
import { assertSwipePublishingBundleMatchesSwipe } from "@/lib/clipstitchr/publishing/media/assertSwipePublishingBundleMatchesSwipe";
import { createSwipePublishingRevision } from "@/lib/clipstitchr/publishing/media/createSwipePublishingRevision";
import { createSwipePublishingSlideObjectKey } from "@/lib/clipstitchr/publishing/media/createSwipePublishingSlideObjectKey";
import { getSwipePublishingBackgroundIdentity } from "@/lib/clipstitchr/publishing/media/server/getSwipePublishingBackgroundIdentity";
import { SWIPE_PUBLISHING_RENDERER_VERSION } from "@/lib/clipstitchr/publishing/media/swipePublishingRendererVersion";
import { TIKTOK_OUTPUT_HEIGHT, TIKTOK_OUTPUT_WIDTH } from "@/lib/clipstitchr/constants/tiktokOutputSize";
import { SWIPE_PUBLISHING_OUTPUT_CONTRACT } from "@/lib/clipstitchr/publishing/media/swipePublishingOutputContract";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ownerId = await getAuthenticatedUserId();

  if (!ownerId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const body = await readSwipePublishingPreparationRequest(request);
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const preparation = await convex.query(
      api.swipePublishingBundles.getPreparation.get,
      { swipeId: body.swipeId },
    );

    if (!preparation) {
      throw new Error("Swipe not found.");
    }

    await convex.mutation(api.rateLimits.consumeSwipePublishingPrepare, {
      secret: getRateLimitApiSecret(),
    });

    const environment = getR2Environment();
    const headClient = createR2Client();
    const backgrounds = await Promise.all(
      preparation.backgrounds.map((background) =>
        getSwipePublishingBackgroundIdentity({
          backgroundId: background.id,
          bucketName: environment.bucketName,
          headClient,
          object: background.imageObject,
          ownerId,
        }),
      ),
    );
    const revision = await createSwipePublishingRevision({
      backgrounds,
      editableStateDigest: preparation.editableStateDigest,
    });
    const existingBundle = preparation.existingBundle;
    let canReuse = false;

    if (
      existingBundle?.revision === revision &&
      existingBundle.editableStateDigest === preparation.editableStateDigest &&
      existingBundle.rendererVersion === SWIPE_PUBLISHING_RENDERER_VERSION
    ) {
      const independentlyDerivedExistingRevision =
        await createSwipePublishingRevision({
          backgrounds: existingBundle.backgrounds,
          editableStateDigest: existingBundle.editableStateDigest,
          rendererVersion: existingBundle.rendererVersion,
        });

      canReuse = independentlyDerivedExistingRevision === revision;
    }

    if (canReuse && existingBundle) {
      try {
        assertSwipePublishingBundleMatchesSwipe({
          bundle: existingBundle,
          ownerId,
          revision,
          slideCount: preparation.slideCount,
          swipeId: preparation.swipeId,
        });
      } catch {
        canReuse = false;
      }
    }

    if (canReuse && existingBundle) {
      return Response.json({
        bundle: existingBundle,
        status: "reusable",
      });
    }

    if (!body.slides) {
      return Response.json({
        revision,
        status: "render_required",
      });
    }

    if (
      body.revision !== revision ||
      body.slides.length !== preparation.slideCount
    ) {
      throw new Error("Swipe publishing render inputs changed.");
    }

    const createdAt = new Date().toISOString();
    const slides = body.slides.map((slide) => ({
      checksumSha256: slide.checksumSha256,
      height: TIKTOK_OUTPUT_HEIGHT,
      index: slide.index,
      object: {
        contentType: SWIPE_PUBLISHING_OUTPUT_CONTRACT.mimeType,
        key: createSwipePublishingSlideObjectKey({
          checksumSha256: slide.checksumSha256,
          ownerId,
          revision,
          slideIndex: slide.index,
          swipeId: preparation.swipeId,
        }),
        size: slide.sizeBytes,
      },
      width: TIKTOK_OUTPUT_WIDTH,
    }));
    const bundle = {
      backgrounds,
      createdAt,
      editableStateDigest: preparation.editableStateDigest,
      rendererVersion: SWIPE_PUBLISHING_RENDERER_VERSION,
      revision,
      slides,
    };
    const attemptId = crypto.randomUUID();
    const expiresIn = getR2SignedUrlExpiresSeconds();
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    await convex.mutation(api.swipePublishingBundles.reserve.reserve, {
      attemptId,
      bundle,
      expiresAt,
      secret: getRateLimitApiSecret(),
      swipeId: preparation.swipeId,
    });

    const grants = await Promise.all(
      slides.map(async (slide) => {
        const signedUrl = await getR2UploadSignedUrl({
          checksumSha256: slide.checksumSha256,
          contentLength: slide.object.size,
          contentType: slide.object.contentType,
          key: slide.object.key,
          preventOverwrite: true,
        });

        return {
          checksumSha256: slide.checksumSha256,
          contentType: SWIPE_PUBLISHING_OUTPUT_CONTRACT.mimeType,
          key: slide.object.key,
          size: slide.object.size,
          slideIndex: slide.index,
          url: signedUrl.url,
        };
      }),
    );

    return Response.json({
      attemptId,
      grants,
      revision,
      status: "upload",
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
            : "Unable to prepare Swipe publishing media.",
      },
      { status: 400 },
    );
  }
}
