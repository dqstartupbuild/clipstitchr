import type { Doc } from "./_generated/dataModel";
import { getSwipeCardSearchText } from "./getSwipeCardSearchText";

export function createSwipeCardFields(swipe: Doc<"swipes">) {
  return {
    ownerId: swipe.ownerId,
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
    socialCaption: swipe.socialCaption,
    slides: swipe.slides,
    publishingRevision: swipe.publishingRevision,
    publishingBundle: swipe.publishingBundle,
    searchText: getSwipeCardSearchText(swipe),
    posterObject: swipe.posterObject,
    posterVersion: swipe.posterVersion,
    postBridgePosts: swipe.postBridgePosts,
    isPosted: swipe.isPosted,
    postedAt: swipe.postedAt,
    automation: swipe.automation,
    createdAt: swipe.createdAt,
    updatedAt: swipe.updatedAt,
  };
}
