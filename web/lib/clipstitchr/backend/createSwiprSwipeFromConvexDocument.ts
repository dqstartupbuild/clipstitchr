import type { Doc } from "@/convex/_generated/dataModel";
import type { SwiprSwipe } from "@/lib/clipstitchr/types/SwiprSwipe";

export function createSwiprSwipeFromConvexDocument(
  swipe: Doc<"swipes"> | Doc<"swipeCards">,
  posterBlob?: Blob,
): SwiprSwipe {
  return {
    id: swipe.id,
    name: swipe.name,
    searchText: "searchText" in swipe ? swipe.searchText : undefined,
    productSourceType: swipe.productSourceType,
    productSourceId: swipe.productSourceId,
    productContext: swipe.productContext,
    productName: swipe.productName,
    backgroundId: swipe.backgroundId,
    caption: swipe.caption,
    description: swipe.description,
    hashtags: swipe.hashtags,
    rationale: "rationale" in swipe ? swipe.rationale : undefined,
    socialCaption: swipe.socialCaption,
    slides: swipe.slides,
    publishingRevision: swipe.publishingRevision,
    publishingBundle: swipe.publishingBundle,
    posterObject: swipe.posterObject,
    posterBlob,
    posterVersion: swipe.posterVersion,
    isPosted: swipe.isPosted,
    postedAt: swipe.postedAt,
    createdAt: swipe.createdAt,
    updatedAt: swipe.updatedAt,
  };
}
