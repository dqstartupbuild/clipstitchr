import type { Doc } from "@/convex/_generated/dataModel";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

export function createSwiprSwipeFromConvexDocument(
  swipe: Doc<"swipes">,
  posterBlob?: Blob,
): SwiprSwipe {
  return {
    id: swipe.id,
    name: swipe.name,
    productSourceType: swipe.productSourceType,
    productSourceId: swipe.productSourceId,
    productContext: swipe.productContext,
    productName: swipe.productName,
    backgroundId: swipe.backgroundId,
    caption: swipe.caption,
    description: swipe.description,
    hashtags: swipe.hashtags,
    rationale: swipe.rationale,
    socialCaption: swipe.socialCaption,
    slides: swipe.slides,
    posterObject: swipe.posterObject,
    posterBlob,
    posterVersion: swipe.posterVersion,
    isPosted: swipe.isPosted,
    postedAt: swipe.postedAt,
    createdAt: swipe.createdAt,
    updatedAt: swipe.updatedAt,
  };
}
