import { createSwiprBatchTextGeneration } from "@/lib/clipstitchr/server/createSwiprBatchTextGeneration";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createSwiprAutomationTextGeneration({
  callToActionStyle,
  creativeContext,
  product,
  replicate,
  slideCount,
}: {
  callToActionStyle: SwiprCallToActionStyle;
  creativeContext: string;
  product: ProductProfile;
  replicate: ReplicateClient;
  slideCount: number;
}) {
  const generation = await createSwiprBatchTextGeneration({
    callToActionStyle,
    count: 1,
    creativeContext,
    product,
    replicate,
    slideCount,
  });
  const slideshow = generation.slideshows[0];

  if (!slideshow) {
    throw new Error("The writing provider did not return a Swipr slideshow.");
  }

  return {
    ...slideshow,
    providerModel: generation.providerModel,
    providerPredictionId: generation.providerPredictionId,
  };
}
