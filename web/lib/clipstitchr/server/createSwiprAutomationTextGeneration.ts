import { createSwiprBatchTextGeneration } from "@/lib/clipstitchr/server/createSwiprBatchTextGeneration";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createSwiprAutomationTextGeneration({
  product,
  replicate,
  slideCount,
}: {
  product: ProductProfile;
  replicate: ReplicateClient;
  slideCount: number;
}) {
  const generation = await createSwiprBatchTextGeneration({
    count: 1,
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
