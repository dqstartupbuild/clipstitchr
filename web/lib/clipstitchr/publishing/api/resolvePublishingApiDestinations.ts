import type { ConvexHttpClient } from "convex/browser";

import type { PublishingApiMediaResolution } from "@/lib/clipstitchr/publishing/api/PublishingApiMediaResolution";
import { assertPublishingYouTubeThumbnailManifest } from "@/lib/clipstitchr/publishing/api/assertPublishingYouTubeThumbnailManifest";
import { resolvePublishingApiMedia } from "@/lib/clipstitchr/publishing/api/resolvePublishingApiMedia";
import type { PublishingDestinationRequest } from "@/lib/clipstitchr/publishing/client/contracts/PublishingDestinationRequest";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";
import type { PublishingApiDestinationRequest } from "@/services/publishing-service/src/publishing-api/PublishingApiDestinationRequest";

export async function resolvePublishingApiDestinations(input: {
  convex: ConvexHttpClient;
  destinations: readonly PublishingDestinationRequest[];
  productId: string;
}): Promise<readonly PublishingApiDestinationRequest[]> {
  const thumbnailResolutions = new Map<
    string,
    Promise<PublishingApiMediaResolution>
  >();

  return await Promise.all(
    input.destinations.map(async (destination) => {
      if (destination.provider !== "youtube") {
        return destination;
      }

      const { thumbnail, ...settings } = destination.settings;
      if (!thumbnail) {
        return Object.freeze({
          ...destination,
          settings: Object.freeze(settings),
        });
      }

      const cacheKey = JSON.stringify([
        thumbnail.media.kind,
        thumbnail.media.recordId,
        thumbnail.mediaRevision,
      ]);
      let resolution = thumbnailResolutions.get(cacheKey);
      if (!resolution) {
        resolution = resolvePublishingApiMedia({
          convex: input.convex,
          descriptor: thumbnail.media,
          productId: input.productId,
        });
        thumbnailResolutions.set(cacheKey, resolution);
      }
      const resolvedThumbnail = await resolution;

      if (
        resolvedThumbnail.manifest.sourceRevision !== thumbnail.mediaRevision
      ) {
        throw new PublishingProxyRequestError(
          409,
          "stale_thumbnail_revision",
        );
      }
      assertPublishingYouTubeThumbnailManifest(resolvedThumbnail.manifest);

      return Object.freeze({
        ...destination,
        settings: Object.freeze({
          ...settings,
          thumbnail: resolvedThumbnail.manifest,
        }),
      });
    }),
  );
}
