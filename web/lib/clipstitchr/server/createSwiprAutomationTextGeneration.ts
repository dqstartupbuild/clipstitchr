import { createSwiprBatchTextGeneration } from "@/lib/clipstitchr/server/createSwiprBatchTextGeneration";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createSwiprAutomationTextGeneration({
  callToActionStyle,
  count,
  creativeContext,
  product,
  replicate,
  slideCount,
}: {
  callToActionStyle: SwiprCallToActionStyle;
  count: number;
  creativeContext: string;
  product: ProductProfile;
  replicate: ReplicateClient;
  slideCount: number;
}) {
  const generation = await createSwiprBatchTextGeneration({
    callToActionStyle,
    count,
    creativeContext,
    product,
    replicate,
    slideCount,
  });
  if (generation.slideshows.length !== count) {
    throw new Error(
      `The writing provider returned ${generation.slideshows.length} of ${count} requested Swipr slideshows.`,
    );
  }

  return generation;
}
