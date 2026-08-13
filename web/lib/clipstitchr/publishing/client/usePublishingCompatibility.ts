"use client";

import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";
import { checkPublishingMediaCompatibility } from "@/lib/clipstitchr/publishing/client/requests/checkPublishingMediaCompatibility";
import { usePublishingResource } from "@/lib/clipstitchr/publishing/client/usePublishingResource";

export function usePublishingCompatibility(
  media: PublishingMediaDescriptor | null,
  destinations: PublishingIntegration[],
) {
  const requestKey =
    media && destinations.length
      ? `${media.kind}:${media.recordId}:${destinations
          .map((destination) => `${destination.provider}:${destination.id}`)
          .sort()
          .join(",")}`
      : null;

  return usePublishingResource(
    (signal) => {
      if (!media || !destinations.length) {
        return Promise.reject(new Error("Choose saved media and a destination."));
      }
      return checkPublishingMediaCompatibility(
        {
          destinations: destinations.map((destination) => ({
            integrationId: destination.id,
            provider: destination.provider,
          })),
          media,
        },
        signal,
      );
    },
    requestKey,
  );
}
