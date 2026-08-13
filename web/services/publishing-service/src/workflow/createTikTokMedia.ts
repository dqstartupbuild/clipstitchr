import type { TikTokPublishRequest } from "../provider-runtime/tiktok/TikTokPublishRequest.js";
import type { PublishingWorkflowMediaGrant } from "./PublishingWorkflowMediaGrant.js";
import type { PublishingWorkflowWorkItem } from "./PublishingWorkflowWorkItem.js";

export const createTikTokMedia = (
  item: PublishingWorkflowWorkItem,
  grants: readonly PublishingWorkflowMediaGrant[],
): TikTokPublishRequest["media"] => {
  if (grants.length !== item.media.length || grants.length < 1) {
    throw new TypeError("TikTok media grants do not match the durable manifest.");
  }
  const urls = grants.map((grant) => grant.url);
  const video = item.media[0]?.contentType === "video/mp4";

  if (video) {
    const durationSeconds = item.media[0]?.durationSeconds;
    if (
      item.media.length !== 1 ||
      urls.length !== 1 ||
      durationSeconds === null ||
      durationSeconds === undefined
    ) {
      throw new TypeError("TikTok video metadata is incomplete.");
    }
    return Object.freeze({
      kind: "video" as const,
      urls: Object.freeze([urls[0] as string]) as readonly [string],
      durationSeconds,
    });
  }

  if (item.media.some((media) => media.contentType === "video/mp4")) {
    throw new TypeError("TikTok cannot mix photo and video media.");
  }

  return Object.freeze({
    kind: "photo" as const,
    urls: Object.freeze(urls),
  });
};
