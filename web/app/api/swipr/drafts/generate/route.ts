import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createSwiprBatchTextGeneration } from "@/lib/clipstitchr/server/createSwiprBatchTextGeneration";
import { createSwiprDraftSlides } from "@/lib/clipstitchr/server/createSwiprDraftSlides";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { pickSwiprDraftBackgroundIds } from "@/lib/clipstitchr/server/pickSwiprDraftBackgroundIds";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { readSwiprLibraryQueries } from "@/lib/clipstitchr/server/readSwiprLibraryQueries";
import { SWIPR_BATCH_DRAFT_COUNT } from "@/lib/clipstitchr/constants/swiprBatchDraftCount";
import { SWIPR_MAX_SLIDE_COUNT } from "@/lib/clipstitchr/constants/swiprSlideCountBounds";
import { getProductSwiprContext } from "@/lib/clipstitchr/utils/getProductSwiprContext";
import { getSwiprSwipeName } from "@/lib/clipstitchr/utils/getSwiprSwipeName";
import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

type SwiprDraftGenerationRequest = {
  count?: unknown;
  productId?: unknown;
  selectedLibraryQueries?: unknown;
};

function readProductId(value: unknown) {
  const productId = typeof value === "string" ? value.trim() : "";

  if (!productId) {
    throw new Error("Choose a saved product first.");
  }

  return productId;
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const body = (await request.json()) as SwiprDraftGenerationRequest;
    const count = SWIPR_BATCH_DRAFT_COUNT;
    const productId = readProductId(body.productId);
    const slideCount = SWIPR_MAX_SLIDE_COUNT;
    const selectedLibraryQueries = readSwiprLibraryQueries(
      body.selectedLibraryQueries,
    );

    if (!selectedLibraryQueries.length) {
      throw new Error(
        "Choose at least one Pexels pack before generating draft Swipes.",
      );
    }

    const selectedLibraryQueryKeys = selectedLibraryQueries.map((libraryQuery) =>
      normalizeSwiprLibraryQueryKey(libraryQuery),
    );
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeCliprHookScript, {
      count,
      secret,
    });

    const [productDocument, backgroundDocuments] = await Promise.all([
      convex.query(api.products.get, { id: productId }),
      convex.query(api.swiprBackgrounds.listByLibraryQueryKeys, {
        libraryQueryKeys: selectedLibraryQueryKeys,
      }),
    ]);

    if (!productDocument) {
      throw new Error("Saved product not found.");
    }

    const libraryBackgrounds = backgroundDocuments.filter(
      (background) => background.source === "pexels" && background.libraryQuery,
    );

    if (!libraryBackgrounds.length) {
      throw new Error("Import Pexels photos before generating draft Swipes.");
    }

    const product = createProductProfileFromConvexDocument(productDocument);
    const textGeneration = await createSwiprBatchTextGeneration({
      count,
      product,
      replicate: createReplicateClient(),
      slideCount,
    });
    const createdSwipeIds: string[] = [];

    for (const [index, slideshow] of textGeneration.slideshows.entries()) {
      const backgroundIds = pickSwiprDraftBackgroundIds({
        availableBackgroundIds: libraryBackgrounds.map(
          (background) => background.id,
        ),
        offset: index * slideCount,
        slideCount,
      });
      const slides = createSwiprDraftSlides({
        backgroundIds,
        texts: slideshow.slides,
      });
      const id = createId();
      const now = new Date().toISOString();

      await convex.mutation(api.swipes.save, {
        id,
        backgroundId: backgroundIds[0],
        caption: slideshow.caption,
        createdAt: now,
        description: slideshow.description,
        hashtags: slideshow.hashtags,
        name: getSwiprSwipeName(product.name),
        productContext: getProductSwiprContext(product),
        productName: product.name,
        productSourceId: product.id,
        productSourceType: "saved-product",
        rationale: slideshow.rationale,
        slides,
        socialCaption: slideshow.socialCaption,
        updatedAt: now,
      });
      createdSwipeIds.push(id);
    }

    return Response.json({
      count: createdSwipeIds.length,
      ids: createdSwipeIds,
      providerModel: textGeneration.providerModel,
      providerPredictionId: textGeneration.providerPredictionId,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to generate draft Swipes.",
      },
      { status: 400 },
    );
  }
}
