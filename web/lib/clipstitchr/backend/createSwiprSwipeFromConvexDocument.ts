import type { Doc } from "@/convex/_generated/dataModel";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

export function createSwiprSwipeFromConvexDocument(
  swipe: Doc<"swipes">,
): SwiprSwipe {
  return {
    id: swipe.id,
    name: swipe.name,
    productSourceType: swipe.productSourceType,
    productSourceId: swipe.productSourceId,
    productContext: swipe.productContext,
    productName: swipe.productName,
    backgroundId: swipe.backgroundId,
    slides: swipe.slides,
    createdAt: swipe.createdAt,
    updatedAt: swipe.updatedAt,
  };
}
