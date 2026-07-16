import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { readSwiprLibraryQueries } from "@/lib/clipstitchr/server/readSwiprLibraryQueries";
import { waitForProviderJob } from "@/lib/clipstitchr/server/waitForProviderJob";
import { SWIPR_BATCH_DRAFT_COUNT } from "@/lib/clipstitchr/constants/swiprBatchDraftCount";
import { SWIPR_MAX_SLIDE_COUNT } from "@/lib/clipstitchr/constants/swiprSlideCountBounds";
import { normalizeSwiprLibraryQueryKey } from "@/lib/clipstitchr/utils/normalizeSwiprLibraryQueryKey";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getSwiprCallToActionStyle } from "@/lib/clipstitchr/utils/getSwiprCallToActionStyle";
import { normalizeSwiprCreativeContext } from "@/lib/clipstitchr/utils/normalizeSwiprCreativeContext";

export const runtime = "nodejs";

type SwiprDraftGenerationRequest = {
  callToActionStyle?: unknown;
  count?: unknown;
  creativeContext?: unknown;
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
    const callToActionStyle = getSwiprCallToActionStyle(body.callToActionStyle);
    const creativeContext = normalizeSwiprCreativeContext(body.creativeContext);
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

    const selectedLibraryQueryKeys = selectedLibraryQueries.map(
      (libraryQuery) => normalizeSwiprLibraryQueryKey(libraryQuery),
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
    const batchId = createId();
    const reservations = await convex.mutation(
      api.usage.reserveCreationCreditBatch.reserveCreationCreditBatch,
      {
        batchId,
        count,
        domainIdPrefix: `swipr:${batchId}`,
        domainKind: "swipe",
        idempotencyPrefix: `swipr:${userId}:${batchId}`,
        now: new Date().toISOString(),
        operation: "swipr",
      },
    );

    if (!reservations.length) {
      throw new Error(
        "You need 20 creation credits for each Swipe. Add credits or wait for your next plan renewal.",
      );
    }

    const usageReservationIds = reservations.flatMap((reservation) =>
      reservation.reservationId ? [reservation.reservationId] : [],
    );
    const providerJobId = `provider:manual-swipr-draft:${batchId}`;

    try {
      await convex.mutation(api.providerJobs.create, {
        secret,
        ownerId: userId,
        id: providerJobId,
        jobType: "manual-swipr-draft",
        stage: "awaiting-provider",
        idempotencyKey: `${userId}:manual-swipr-draft:${batchId}`,
        inputSnapshotJson: JSON.stringify({
          availableBackgroundIds: libraryBackgrounds.map(
            (background) => background.id,
          ),
          batchId,
          callToActionStyle,
          count: usageReservationIds.length,
          creativeContext,
          product,
          slideCount,
        }),
        usageReservationIds,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      await Promise.all(
        reservations.flatMap((reservation) =>
          reservation.reservationId
            ? [
                convex.mutation(
                  api.usage.cancelUsageReservation.cancelUsageReservation,
                  {
                    now: new Date().toISOString(),
                    reason: "Swipr draft job could not be queued",
                    reservationId: reservation.reservationId,
                  },
                ),
              ]
            : [],
        ),
      );
      throw error;
    }
    const job = await waitForProviderJob(convex, providerJobId);

    return Response.json({
      count: job.outputAssetIds.length,
      ids: job.outputAssetIds,
      providerModel: getCliprHookModelId(),
      providerPredictionId: job.providerJobIds[0],
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
