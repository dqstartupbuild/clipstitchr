import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";
import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";
import { readPublishingCompatibilityResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingCompatibilityResponse";
import { PublishingApiError } from "@/lib/clipstitchr/publishing/client/PublishingApiError";

export async function checkPublishingMediaCompatibility(
  input: {
    destinations: { integrationId: string; provider: PublishingProvider }[];
    media: PublishingMediaDescriptor;
  },
  signal?: AbortSignal,
) {
  const response = await fetch("/api/studio/publishing/media/compatibility", {
    body: JSON.stringify(input),
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    signal,
  });
  const result = await readPublishingCompatibilityResponse(response);
  const requestedIds = new Set(
    input.destinations.map((destination) => destination.integrationId),
  );
  const returnedIds = new Set(
    result.destinations.map((destination) => destination.integrationId),
  );
  if (
    returnedIds.size !== result.destinations.length ||
    returnedIds.size !== requestedIds.size ||
    [...returnedIds].some((id) => !requestedIds.has(id))
  ) {
    throw new PublishingApiError({
      code: "invalid_response",
      message: "Publishing returned compatibility for the wrong destination.",
      status: response.status,
    });
  }
  return result;
}
