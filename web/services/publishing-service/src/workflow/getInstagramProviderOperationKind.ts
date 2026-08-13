import type { PublishingProviderOperationKind } from "../persistence/PublishingProviderOperationKind.js";
import type { InstagramPublishCheckpoint } from "../provider-runtime/instagram/InstagramPublishCheckpoint.js";

export const getInstagramProviderOperationKind = (
  checkpoint: InstagramPublishCheckpoint | undefined,
): PublishingProviderOperationKind => {
  switch (checkpoint?.phase) {
    case "create_parent":
    case "create_parent_dispatched":
    case "wait_parent":
      return "meta-carousel-container";
    case "ready_to_publish":
    case "publish_dispatched":
    case "published":
      return "meta-media-publish";
    default:
      return "meta-media-container";
  }
};
