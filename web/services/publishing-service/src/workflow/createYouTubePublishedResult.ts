import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";

export const createYouTubePublishedResult = (
  videoId: string,
  visibility: string,
): ProviderPublishResult =>
  Object.freeze({
    provider: "youtube",
    kind: "published",
    providerOperationId: videoId,
    remotePostIds: Object.freeze([videoId]),
    remoteUrls: Object.freeze([
      `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
    ]),
    visibility,
  });
