import type { InstagramMedia } from "../provider-runtime/instagram/InstagramMedia.js";
import type { PublishingWorkflowMediaGrant } from "./PublishingWorkflowMediaGrant.js";
import type { PublishingWorkflowWorkItem } from "./PublishingWorkflowWorkItem.js";

export const createInstagramMedia = (
  item: PublishingWorkflowWorkItem,
  grants: readonly PublishingWorkflowMediaGrant[],
): readonly InstagramMedia[] => {
  if (grants.length !== item.media.length || grants.length < 1) {
    throw new TypeError("Instagram media grants do not match the durable manifest.");
  }

  return Object.freeze(
    item.media.map((media, index) => {
      const grant = grants[index];
      if (grant === undefined) {
        throw new TypeError("Instagram media grant is missing.");
      }
      return Object.freeze({
        kind: media.contentType === "video/mp4" ? "video" : "image",
        url: grant.url,
      });
    }),
  );
};
