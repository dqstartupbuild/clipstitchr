import { createSwiprBatchTextGeneration } from "@/lib/clipstitchr/server/createSwiprBatchTextGeneration";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";
import type { Prediction } from "replicate";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createSwiprAutomationTextGeneration({
  callToActionStyle,
  count,
  creativeContext,
  product,
  prediction,
  replicate,
  onPredictionCreated,
  slideCount,
}: {
  callToActionStyle: SwiprCallToActionStyle;
  count: number;
  creativeContext: string;
  product: ProductProfile;
  prediction?: Prediction;
  replicate: ReplicateClient;
  onPredictionCreated?: (prediction: Prediction) => void | Promise<void>;
  slideCount: number;
}) {
  const generation = await createSwiprBatchTextGeneration({
    callToActionStyle,
    count,
    creativeContext,
    product,
    prediction,
    replicate,
    onPredictionCreated,
    slideCount,
  });
  if (generation.slideshows.length !== count) {
    throw new Error(
      `The writing provider returned ${generation.slideshows.length} of ${count} requested Swipr slideshows.`,
    );
  }

  return generation;
}
