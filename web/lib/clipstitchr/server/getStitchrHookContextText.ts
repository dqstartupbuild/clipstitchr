import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";

export function getStitchrHookContextText(
  product: ProductProfile,
  clipContexts: StitchrTextGenerationClipContext[],
) {
  return [
    product.name,
    product.productDetails,
    product.audienceDetails,
    product.emotionalNarrative,
    product.inferredProblem,
    ...product.inferredPainPoints,
    ...clipContexts.flatMap((context) => [
      context.name,
      context.libraryKind,
      context.videoDescription,
      context.mainPersonDescription,
      context.outfitDescription,
      context.locationDescription,
      context.poseDescription,
      context.productDescription,
      context.quickEditOverlayTextHint,
      context.quickEditOverlayTextReason,
      ...(context.tags ?? []),
    ]),
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .toLowerCase();
}
