import type { Prediction } from "replicate";
import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createSwiprBatchTextGeneration } from "@/lib/clipstitchr/server/createSwiprBatchTextGeneration";
import { createSwiprDraftSlides } from "@/lib/clipstitchr/server/createSwiprDraftSlides";
import { pickSwiprDraftBackgroundIds } from "@/lib/clipstitchr/server/pickSwiprDraftBackgroundIds";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";
import { getProductSwiprContext } from "@/lib/clipstitchr/utils/getProductSwiprContext";
import { getSwiprSwipeName } from "@/lib/clipstitchr/utils/getSwiprSwipeName";

const api = anyApi;

type ManualSwiprDraftJob = {
  id: string;
  inputSnapshotJson: string;
  ownerId: string;
  providerJobIds: string[];
  usageReservationIds?: string[];
};

type ManualSwiprDraftJobInput = {
  availableBackgroundIds: string[];
  batchId: string;
  callToActionStyle: SwiprCallToActionStyle;
  count: number;
  creativeContext: string;
  product: ProductProfile;
  slideCount: number;
};

function parseInput(inputSnapshotJson: string): ManualSwiprDraftJobInput {
  const input = JSON.parse(
    inputSnapshotJson,
  ) as Partial<ManualSwiprDraftJobInput>;

  if (
    !input.batchId ||
    !input.product ||
    !Array.isArray(input.availableBackgroundIds) ||
    input.availableBackgroundIds.length === 0 ||
    typeof input.count !== "number" ||
    typeof input.slideCount !== "number" ||
    typeof input.creativeContext !== "string" ||
    typeof input.callToActionStyle !== "string"
  ) {
    throw new Error("Manual Swipr draft job input is incomplete.");
  }

  return input as ManualSwiprDraftJobInput;
}

export async function processManualSwiprDraft(
  client: ConvexHttpClient,
  job: ManualSwiprDraftJob,
  providerWorkerSecret: string,
) {
  const input = parseInput(job.inputSnapshotJson);
  const reservationIds = job.usageReservationIds ?? [];
  const requestedCount = Math.min(input.count, reservationIds.length);

  if (requestedCount < 1) {
    throw new Error("Manual Swipr draft job has no usage reservations.");
  }

  const replicate = createReplicateClient();
  const existingPredictionId = job.providerJobIds[0];
  const existingPrediction = existingPredictionId
    ? await replicate.predictions.get(existingPredictionId)
    : undefined;
  const textGeneration = await createSwiprBatchTextGeneration({
    callToActionStyle: input.callToActionStyle,
    count: requestedCount,
    creativeContext: input.creativeContext,
    product: input.product,
    prediction: existingPrediction,
    replicate,
    onPredictionCreated: async (prediction: Prediction) => {
      if (existingPredictionId) {
        return;
      }

      await client.mutation(api.providerJobs.markProviderStatus, {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        id: job.id,
        status: "running",
        stage: "provider-created",
        providerJobId: prediction.id,
        progress: 0.25,
        updatedAt: new Date().toISOString(),
      });
    },
    slideCount: input.slideCount,
  });
  const unusedReservationIds = reservationIds.slice(
    textGeneration.slideshows.length,
  );

  if (unusedReservationIds.length > 0) {
    await client.mutation(
      api.usage.releaseUsageReservationsFromProvider
        .releaseUsageReservationsFromProvider,
      {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        reservationIds: unusedReservationIds,
        now: new Date().toISOString(),
        reason: "Swipr provider returned fewer drafts",
      },
    );
  }

  const coverBackgroundIds = pickSwiprDraftBackgroundIds({
    availableBackgroundIds: input.availableBackgroundIds,
    slideCount: textGeneration.slideshows.length,
  });
  let lastSaveError: unknown;
  let savedCount = 0;

  for (const [index, slideshow] of textGeneration.slideshows.entries()) {
    const usageReservationId = reservationIds[index];

    if (!usageReservationId) {
      break;
    }

    const swipeId = `swipr:${input.batchId}:${index}`;
    const backgroundIds = pickSwiprDraftBackgroundIds({
      availableBackgroundIds: input.availableBackgroundIds,
      preferredFirstBackgroundId: coverBackgroundIds[index],
      slideCount: input.slideCount,
    });
    const now = new Date().toISOString();

    try {
      await client.mutation(api.swipes.saveFromProvider, {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        id: swipeId,
        backgroundId: backgroundIds[0],
        caption: slideshow.caption,
        createdAt: now,
        description: slideshow.description,
        hashtags: slideshow.hashtags,
        name: getSwiprSwipeName(input.product.name),
        productContext: getProductSwiprContext(input.product),
        productName: input.product.name,
        productSourceId: input.product.id,
        productSourceType: "saved-product",
        rationale: slideshow.rationale,
        slides: createSwiprDraftSlides({
          backgroundIds,
          texts: slideshow.slides,
        }),
        socialCaption: slideshow.socialCaption,
        usageReservationId,
        updatedAt: now,
      });
      savedCount += 1;

      await client.mutation(api.providerJobs.markProviderStatus, {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        id: job.id,
        status: "running",
        stage: "saving-batch",
        outputAssetId: swipeId,
        providerJobId: textGeneration.providerPredictionId,
        progress: Math.min(0.95, 0.25 + (savedCount / requestedCount) * 0.7),
        updatedAt: now,
      });
    } catch (error) {
      lastSaveError = error;
      await client.mutation(
        api.usage.releaseUsageReservationsFromProvider
          .releaseUsageReservationsFromProvider,
        {
          secret: providerWorkerSecret,
          ownerId: job.ownerId,
          reservationIds: [usageReservationId],
          now,
          reason: "Swipr draft could not be saved",
        },
      );
    }
  }

  if (savedCount === 0) {
    throw lastSaveError ?? new Error("The Swipr provider returned no drafts.");
  }

  await client.mutation(api.providerJobs.markProviderStatus, {
    secret: providerWorkerSecret,
    ownerId: job.ownerId,
    id: job.id,
    status: "completed",
    stage: "completed",
    providerJobId: textGeneration.providerPredictionId,
    progress: 1,
    updatedAt: new Date().toISOString(),
  });
}
